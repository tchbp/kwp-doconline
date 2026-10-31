import { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Radio,
  InputNumber,
  Space,
  Typography,
  Tag,
  Divider,
  Segmented,
  Popconfirm,
  Slider,
  ColorPicker,
  Checkbox,
} from "antd";
import {
  FilePdfOutlined,
  SaveOutlined,
  AimOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CloseOutlined,
  ClearOutlined,
  ExpandOutlined,
  CompressOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import {
  buildStampLines,
  getStampDateText,
  getStampTimeText,
  CM_TO_PT,
} from "../utils/pdfHelper";

const { Title, Text } = Typography;
const { TextArea } = Input;

const PRESET_COLORS = [
  { label: "ดำ", value: "#000000", bg: "#000000", text: "#ffffff" },
  { label: "น้ำเงิน", value: "#002060", bg: "#002060", text: "#ffffff" },
  { label: "แดง", value: "#c00000", bg: "#c00000", text: "#ffffff" },
  { label: "เขียว", value: "#007a33", bg: "#007a33", text: "#ffffff" },
];

const ControlPanel = ({
  form,
  onLoadPdf,
  loading,
  mode,
  setMode,
  annotations,
  selectedId,
  onSelectAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  onClearAnnotations,
  currentPage,
  onSave,
  saving,
  lastClickedCoord,
  signatureCache,
  onFetchSignature,
  //pdfID2Load,
  typeJob,
  memo,
  stamp,
}) => {
  const [nudgeStep, setNudgeStep] = useState(1);
  const [listFilter, setListFilter] = useState("all"); // 'current' or 'all'
  const [formTextColor, setFormTextColor] = useState("#0A42BA");
  const [formSigScale, setFormSigScale] = useState(0.3);
  const [formStampColor, setFormStampColor] = useState("#0A42BA");

  const watchedThaiText = Form.useWatch("thaiText", form);
  const watchedFontSize = Form.useWatch("fontSize", form);
  const watchedStampReceiptNo = Form.useWatch("stampReceiptNo", form);
  const watchedStampWidth = Form.useWatch("stampWidth", form);
  const watchedStampHeight = Form.useWatch("stampHeight", form);
  const watchedStampFontSize = Form.useWatch("stampFontSize", form);

  const selectedAnnotation = annotations.find((a) => a.id === selectedId);

  // คำนวณจำนวนรายการ
  const currentPageIndex = currentPage - 1;
  const currentCount = annotations.filter(
    (a) => a.pageIndex === currentPageIndex,
  ).length;
  const totalCount = annotations.length;

  const displayAnnotations =
    listFilter === "current"
      ? annotations.filter((a) => a.pageIndex === currentPageIndex)
      : annotations;

  const handleNudge = (dx, dy) => {
    if (!selectedAnnotation) return;
    const newX = Math.max(0, Math.round((selectedAnnotation.x + dx) * 10) / 10);
    const newY = Math.max(0, Math.round((selectedAnnotation.y + dy) * 10) / 10);
    onUpdateAnnotation(selectedAnnotation.id, { x: newX, y: newY });
  };

  const handleOpenPdf = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const values = await form.validateFields(["pdfId"]);
      onLoadPdf(values);
    } catch (err) {
      console.warn("กรุณากรอก PDF File ID:", err);
    }
  };
  // useEffect(() => {
  //   if (pdfID2Load) {
  //     onLoadPdf({ pdfId: pdfID2Load });
  //   }
  // }, [pdfID2Load]);

  return (
    <Card className="w-full shadow-md rounded-lg">
      <Title level={4} className="!mb-4">
        <FilePdfOutlined className="mr-2 text-red-500" /> {typeJob}
        <br />
        <span className="text-xl text-gray-700 font-normal">{memo}</span>
      </Title>

      {/* ฟอร์มหลักเพียง 1 เดียวสำหรับทุกฟิลด์ */}
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          thaiText: "อนุมัติ / ผ่านการตรวจสอบ",
          fontSize: 16,
          textColor: "#0A42BA",
          sigScale: 0.3,
          showSigDate: true,
          sigDateText: getStampDateText(),
          stampReceiptNo: "",
          stampWidth: 5,
          stampHeight: 2.5,
          stampFontSize: 14,
          stampColor: "#0A42BA",
        }}
        onFinish={handleOpenPdf}
      >
        {/* <Form.Item
          label="Google Drive PDF File ID"
          name="pdfId"
          rules={[{ required: true, message: "กรุณากรอก PDF File ID" }]}
        >
          <Input
            placeholder="กรอก File ID ของเอกสาร PDF"
            onPressEnter={handleOpenPdf}
          />
        </Form.Item>

        <Button
          type="primary"
          loading={loading}
          block
          icon={<FilePdfOutlined />}
          onClick={handleOpenPdf}
        >
          เปิดไฟล์ PDF
        </Button> */}

        <Divider className="my-4" />

        {/* เลือกโหมด */}
        <div className="mb-4">
          <Text bold className="block mb-2">
            เลือกโหมดการทำงาน:
          </Text>
          <Radio.Group
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            buttonStyle="solid"
            className="w-full grid grid-cols-2 text-center"
          >
            <Radio.Button value="text" className="text-xs">
              ✏️ ข้อความ
            </Radio.Button>
            <Radio.Button value="signature" className="text-xs">
              ✍️ ลายเซ็น
            </Radio.Button>
            {stamp && (
              <Radio.Button value="stamp" className="text-xs">
                🧾 ตราประทับรับ
              </Radio.Button>
            )}
            <Radio.Button value="select" className="text-xs">
              ✋ ย้าย/เลือก
            </Radio.Button>
          </Radio.Group>
        </div>

        {/* ฟิลด์ตามโหมดที่เลือก (อยู่ใต้ Form เดียวกัน) */}
        {mode === "text" && (
          <div className="p-3 bg-blue-50/60 rounded-md border border-blue-200 mb-4 space-y-3">
            <Text className="text-xs text-blue-700 block font-medium">
              💡 กรอกข้อความ เลือกสีและขนาด แล้วคลิกบนหน้า PDF เพื่อวาง
            </Text>

            <Form.Item
              label="ข้อความภาษาไทย/คอมเมนต์"
              name="thaiText"
              className="!mb-2"
            >
              <TextArea placeholder="กรอกข้อความที่ต้องการวาง" rows={3} />
            </Form.Item>

            {/* ขนาดฟอนต์ */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <Text className="text-xs text-gray-700">ขนาดฟอนต์ (pt):</Text>
                <Space size={4}>
                  {[14, 16, 18, 20, 24].map((sz) => (
                    <Button
                      key={sz}
                      size="small"
                      className="text-[11px] px-1.5 h-6"
                      onClick={() => form.setFieldsValue({ fontSize: sz })}
                    >
                      {sz}
                    </Button>
                  ))}
                </Space>
              </div>
              <Form.Item name="fontSize" className="!mb-0">
                <InputNumber min={8} max={72} className="w-full" />
              </Form.Item>
            </div>

            {/* เลือกสีข้อความ */}
            <div>
              <Text className="text-xs text-gray-700 block mb-1">
                เลือกสีข้อความ:
              </Text>
              <div className="flex flex-wrap items-center gap-2">
                <ColorPicker
                  value={formTextColor}
                  onChange={(color) => {
                    const hex =
                      typeof color === "string"
                        ? color
                        : color?.toHexString
                          ? color.toHexString()
                          : "#000000";
                    setFormTextColor(hex);
                    form.setFieldsValue({ textColor: hex });
                  }}
                  showText
                />
                <Space size={4}>
                  {PRESET_COLORS.map((preset) => (
                    <Button
                      key={preset.value}
                      size="small"
                      style={{
                        backgroundColor: preset.bg,
                        color: preset.text,
                        borderColor:
                          formTextColor === preset.value
                            ? "#1890ff"
                            : "transparent",
                        boxShadow:
                          formTextColor === preset.value
                            ? "0 0 0 2px #1890ff"
                            : "none",
                      }}
                      onClick={() => {
                        setFormTextColor(preset.value);
                        form.setFieldsValue({ textColor: preset.value });
                      }}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </Space>
              </div>
              <Form.Item name="textColor" noStyle>
                <Input type="hidden" />
              </Form.Item>
            </div>

            {/* ตัวอย่างข้อความสด — แสดงครบทุกบรรทัดตามขนาดฟอนต์ที่เลือก */}
            <div className="p-2 bg-white rounded border border-gray-200">
              <span className="text-[10px] text-gray-400 block mb-1">
                ตัวอย่างสี แบบตัวอักษร และขนาด ({watchedFontSize || 16}pt) —
                ครบทุกบรรทัด:
              </span>
              <div
                style={{
                  color: formTextColor,
                  fontSize: `${watchedFontSize || 16}px`,
                  lineHeight: 1.2,
                  fontFamily: "'Sarabun', 'THSarabunNew', sans-serif",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  maxHeight: "10rem",
                  overflow: "auto",
                }}
              >
                {watchedThaiText || "ตัวอย่างข้อความภาษาไทย"}
              </div>
            </div>
          </div>
        )}

        {mode === "signature" && (
          <div className="p-3 bg-emerald-50/60 rounded-md border border-emerald-200 mb-4 space-y-3">
            <Text className="text-xs text-emerald-700 block font-medium">
              💡 กรอก Signature File ID ปรับขนาด แล้วคลิกบนหน้า PDF เพื่อวาง
            </Text>

            <Form.Item
              label="Signature Image ID (Drive)"
              name="sigId"
              className="!mb-2"
            >
              <Input
                placeholder="กรอก File ID ของรูปภาพลายเซ็น"
                disabled
                onChange={(e) => {
                  const val = e.target.value.trim();
                  if (val.length >= 15 && onFetchSignature) {
                    onFetchSignature(val);
                  }
                }}
              />
            </Form.Item>

            {/* แสดงภาพตัวอย่างหากมีใน cache */}
            {(() => {
              const currentSigId = form.getFieldValue("sigId");
              const sigData =
                currentSigId && signatureCache
                  ? signatureCache[currentSigId]
                  : null;
              if (sigData && sigData.dataUrl) {
                return (
                  <div className="p-2 bg-white rounded border border-emerald-300 flex items-center gap-2">
                    <img
                      src={sigData.dataUrl}
                      alt="ตัวอย่างลายเซ็น"
                      className="max-h-12 max-w-[120px] object-contain border bg-gray-50 p-1 rounded"
                    />
                    <div className="text-[11px] text-gray-600">
                      <span className="text-emerald-600 font-semibold block">
                        ภาพพร้อมใช้งาน
                      </span>
                      ขนาด: {sigData.width} × {sigData.height} px
                    </div>
                  </div>
                );
              }
              return (
                <div>
                  <Button
                    size="small"
                    type="dashed"
                    onClick={() => {
                      const curId = form.getFieldValue("sigId");
                      if (curId && onFetchSignature) {
                        onFetchSignature(curId.trim());
                      }
                    }}
                  >
                    🔍 โหลดดูภาพตัวอย่างลายเซ็น
                  </Button>
                </div>
              );
            })()}

            {/* ปรับขนาดขยายลายเซ็นเริ่มต้น */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <Text className="text-xs text-gray-700">ขนาดขยาย (Scale):</Text>
                <span className="text-xs font-mono font-bold text-emerald-600">
                  x{formSigScale} ({Math.round(formSigScale * 100)}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Slider
                  min={0.05}
                  max={2.0}
                  step={0.05}
                  value={formSigScale}
                  onChange={(val) => {
                    setFormSigScale(val);
                    form.setFieldsValue({ sigScale: val });
                  }}
                  className="flex-1 !m-0"
                />
                <Form.Item name="sigScale" className="!mb-0" noStyle>
                  <InputNumber
                    min={0.05}
                    max={2.0}
                    step={0.05}
                    value={formSigScale}
                    onChange={(val) => {
                      const v = val || 0.3;
                      setFormSigScale(v);
                      form.setFieldsValue({ sigScale: v });
                    }}
                    className="w-20"
                  />
                </Form.Item>
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                {[
                  { label: "20%", val: 0.2 },
                  { label: "30%", val: 0.3 },
                  { label: "50%", val: 0.5 },
                  { label: "75%", val: 0.75 },
                  { label: "100%", val: 1.0 },
                ].map((preset) => (
                  <Button
                    key={preset.val}
                    size="small"
                    type={formSigScale === preset.val ? "primary" : "default"}
                    className="text-[11px] px-1.5 h-6"
                    onClick={() => {
                      setFormSigScale(preset.val);
                      form.setFieldsValue({ sigScale: preset.val });
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
            {/* ลงวันที่ใต้ลายเซ็น */}
            <div className="pt-2 border-t border-emerald-200">
              <Form.Item
                name="showSigDate"
                valuePropName="checked"
                className="!mb-1"
              >
                <Checkbox>ลงวันที่ปัจจุบันใต้ลายเซ็น</Checkbox>
              </Form.Item>
              <Form.Item
                shouldUpdate={(prev, cur) =>
                  prev.showSigDate !== cur.showSigDate
                }
                noStyle
              >
                {({ getFieldValue }) =>
                  getFieldValue("showSigDate") ? (
                    <div className="mt-1">
                      <Text className="text-xs text-gray-600 block mb-1">
                        รูปแบบวันที่
                      </Text>
                      <Space.Compact block>
                        <Form.Item
                          name="sigDateText"
                          className="!mb-0"
                          style={{ width: "calc(100% - 90px)" }}
                        >
                          <Input size="small" placeholder="16/10/2568" />
                        </Form.Item>
                        <Button
                          size="small"
                          onClick={() =>
                            form.setFieldsValue({
                              sigDateText: getStampDateText(),
                            })
                          }
                        >
                          วันนี้
                        </Button>
                      </Space.Compact>
                    </div>
                  ) : null
                }
              </Form.Item>
            </div>
          </div>
        )}

        {mode === "stamp" && (
          <div className="p-3 bg-rose-50/60 rounded-md border border-rose-200 mb-4 space-y-3">
            <Text className="text-xs text-rose-700 block font-medium">
              💡 กรอกเลขรับ ปรับขนาด แล้วคลิกบนหน้า PDF เพื่อวางตราประทับรับ
              (วันที่/เวลา ใช้เวลาปัจจุบัน)
            </Text>

            <Form.Item label="เลขรับ" name="stampReceiptNo" className="!mb-2">
              <Input placeholder="เช่น 123/2569" />
            </Form.Item>

            <div className="grid grid-cols-2 gap-2">
              <Form.Item
                label="กว้าง (ซ.ม.)"
                name="stampWidth"
                className="!mb-0"
              >
                <InputNumber min={0.5} max={30} step={0.5} className="w-full" />
              </Form.Item>
              <Form.Item
                label="สูง (ซ.ม.)"
                name="stampHeight"
                className="!mb-0"
              >
                <InputNumber min={0.5} max={30} step={0.5} className="w-full" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-2 items-end">
              <Form.Item
                label="ขนาดฟอนต์ (pt)"
                name="stampFontSize"
                className="!mb-0"
              >
                <InputNumber min={6} max={24} step={1} className="w-full" />
              </Form.Item>
              <div>
                <Text className="text-xs text-gray-700 block mb-1">
                  สีกรอบ/ตัวอักษร:
                </Text>
                <ColorPicker
                  value={formStampColor}
                  onChange={(color) => {
                    const hex =
                      typeof color === "string"
                        ? color
                        : color?.toHexString
                          ? color.toHexString()
                          : "#1355E8";
                    setFormStampColor(hex);
                    form.setFieldsValue({ stampColor: hex });
                  }}
                  showText
                />
              </div>
            </div>

            <Form.Item name="stampColor" noStyle>
              <Input type="hidden" />
            </Form.Item>

            {/* ตัวอย่างตราประทับรับสด */}
            <div className="p-2 bg-white rounded border border-gray-200 flex justify-center">
              <div
                style={{
                  width: `${(watchedStampWidth || 5) * 2.2}px`,
                  height: `${(watchedStampHeight || 2.5) * 2.2}px`,
                  border: `1px solid ${formStampColor}`,
                  color: formStampColor,
                  fontSize: `${(watchedStampFontSize || 14) * 1.1}px`,
                  lineHeight: 1.2,
                  fontFamily: "'Sarabun', 'THSarabunNew', sans-serif",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  whiteSpace: "pre",
                }}
              >
                {buildStampLines({
                  receiptNo: watchedStampReceiptNo || "",
                  dateText: getStampDateText(),
                  timeText: getStampTimeText(),
                }).join("\n")}
              </div>
            </div>
          </div>
        )}

        {mode === "select" && (
          <div className="p-3 bg-gray-50 rounded-md border text-xs text-gray-600 mb-4">
            👉 คลิกหรือลากที่ข้อความ/ลายเซ็น/ตราประทับบนเอกสารเพื่อปรับตำแหน่ง
            หรือเลือกรายการจากตารางด้านล่าง
          </div>
        )}
      </Form>

      {/* ส่วนปรับตำแหน่งและแก้ไขรายการที่เลือก (Inspector) */}
      {selectedAnnotation ? (
        <div className="p-3 bg-blue-50/70 border-2 border-blue-400 rounded-lg mb-4">
          <div className="flex items-center justify-between mb-2">
            <Text
              bold
              className="text-sm text-blue-900 flex items-center gap-1"
            >
              <AimOutlined /> ปรับแต่งรายการที่เลือก
            </Text>
            <Space size={4}>
              <Tag
                color={
                  selectedAnnotation.type === "text"
                    ? "blue"
                    : selectedAnnotation.type === "stamp"
                      ? "red"
                      : "green"
                }
              >
                {selectedAnnotation.type === "text"
                  ? "ข้อความ"
                  : selectedAnnotation.type === "stamp"
                    ? "ตราประทับรับ"
                    : "ลายเซ็น"}
              </Tag>
              <Tag color="purple">หน้า {selectedAnnotation.pageIndex + 1}</Tag>
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={() => onSelectAnnotation(null)}
                title="ปิดการเลือก"
              />
            </Space>
          </div>

          {/* พิกัด X, Y */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <Text className="text-xs text-gray-600 block mb-1">
                พิกัด X (จุด):
              </Text>
              <InputNumber
                value={selectedAnnotation.x}
                min={0}
                step={nudgeStep}
                precision={1}
                className="w-full"
                onChange={(val) =>
                  onUpdateAnnotation(selectedAnnotation.id, { x: val || 0 })
                }
              />
            </div>
            <div>
              <Text className="text-xs text-gray-600 block mb-1">
                พิกัด Y (จุด):
              </Text>
              <InputNumber
                value={selectedAnnotation.y}
                min={0}
                step={nudgeStep}
                precision={1}
                className="w-full"
                onChange={(val) =>
                  onUpdateAnnotation(selectedAnnotation.id, { y: val || 0 })
                }
              />
            </div>
          </div>

          {/* ปุ่มปรับละเอียด 4 ทิศทาง (D-Pad) */}
          <div className="mb-3 bg-white/80 p-2 rounded border border-blue-200">
            <div className="flex items-center justify-between mb-1.5">
              <Text className="text-[11px] text-gray-500 font-medium">
                ปุ่มเลื่อนตำแหน่งละเอียด:
              </Text>
              <Segmented
                size="small"
                value={nudgeStep}
                onChange={setNudgeStep}
                options={[
                  { label: "1 pt", value: 1 },
                  { label: "5 pt", value: 5 },
                  { label: "10 pt", value: 10 },
                ]}
              />
            </div>
            <div className="flex flex-col items-center gap-1">
              <Button
                size="small"
                icon={<ArrowUpOutlined />}
                onClick={() => handleNudge(0, nudgeStep)}
                title={`เลื่อนขึ้น (+${nudgeStep} pt)`}
              />
              <div className="flex items-center gap-2">
                <Button
                  size="small"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => handleNudge(-nudgeStep, 0)}
                  title={`เลื่อนซ้าย (-${nudgeStep} pt)`}
                />
                <Button
                  size="small"
                  icon={<ArrowDownOutlined />}
                  onClick={() => handleNudge(0, -nudgeStep)}
                  title={`เลื่อนลง (-${nudgeStep} pt)`}
                />
                <Button
                  size="small"
                  icon={<ArrowRightOutlined />}
                  onClick={() => handleNudge(nudgeStep, 0)}
                  title={`เลื่อนขวา (+${nudgeStep} pt)`}
                />
              </div>
            </div>
          </div>

          {/* แก้ไขเนื้อหา ขนาด และสี */}
          {selectedAnnotation.type === "text" ? (
            <div className="space-y-3 mb-3">
              <div>
                <Text className="text-xs text-gray-600 block mb-1">
                  แก้ไขข้อความ (ทุกบรรทัด):
                </Text>
                <TextArea
                  size="small"
                  autoSize={{ minRows: 2, maxRows: 8 }}
                  value={selectedAnnotation.content}
                  onChange={(e) =>
                    onUpdateAnnotation(selectedAnnotation.id, {
                      content: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <Text className="text-xs text-gray-600">ขนาดฟอนต์ (pt):</Text>
                  <span className="text-xs font-mono font-bold text-blue-600">
                    {selectedAnnotation.size || 16} pt
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <InputNumber
                    size="small"
                    min={8}
                    max={72}
                    value={selectedAnnotation.size || 16}
                    className="w-24"
                    onChange={(val) =>
                      onUpdateAnnotation(selectedAnnotation.id, {
                        size: val || 16,
                      })
                    }
                  />
                  <Button
                    size="small"
                    onClick={() =>
                      onUpdateAnnotation(selectedAnnotation.id, {
                        size: Math.max(8, (selectedAnnotation.size || 16) - 2),
                      })
                    }
                  >
                    -2 pt
                  </Button>
                  <Button
                    size="small"
                    onClick={() =>
                      onUpdateAnnotation(selectedAnnotation.id, {
                        size: Math.min(72, (selectedAnnotation.size || 16) + 2),
                      })
                    }
                  >
                    +2 pt
                  </Button>
                </div>
              </div>

              {/* เปลี่ยนสีข้อความสำหรับรายการนี้ */}
              <div>
                <Text className="text-xs text-gray-600 block mb-1">
                  เปลี่ยนสีข้อความ:
                </Text>
                <div className="flex flex-wrap items-center gap-2">
                  <ColorPicker
                    value={selectedAnnotation.color || "#000000"}
                    onChange={(color) => {
                      const hex =
                        typeof color === "string"
                          ? color
                          : color?.toHexString
                            ? color.toHexString()
                            : "#000000";
                      onUpdateAnnotation(selectedAnnotation.id, { color: hex });
                    }}
                    showText
                  />
                  <Space size={4}>
                    {PRESET_COLORS.map((preset) => (
                      <Button
                        key={preset.value}
                        size="small"
                        style={{
                          backgroundColor: preset.bg,
                          color: preset.text,
                          borderColor:
                            (selectedAnnotation.color || "#000000") ===
                            preset.value
                              ? "#1890ff"
                              : "transparent",
                          boxShadow:
                            (selectedAnnotation.color || "#000000") ===
                            preset.value
                              ? "0 0 0 2px #1890ff"
                              : "none",
                        }}
                        onClick={() =>
                          onUpdateAnnotation(selectedAnnotation.id, {
                            color: preset.value,
                          })
                        }
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </Space>
                </div>
              </div>
            </div>
          ) : selectedAnnotation.type === "stamp" ? (
            <div className="space-y-3 mb-3">
              <div>
                <Text className="text-xs text-gray-600 block mb-1">
                  เลขรับ:
                </Text>
                <Input
                  size="small"
                  value={selectedAnnotation.receiptNo}
                  placeholder="เช่น 123/2569"
                  onChange={(e) =>
                    onUpdateAnnotation(selectedAnnotation.id, {
                      receiptNo: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Text className="text-xs text-gray-600 block mb-1">
                    กว้าง (ซ.ม.):
                  </Text>
                  <InputNumber
                    size="small"
                    min={0.5}
                    max={30}
                    step={0.5}
                    className="w-full"
                    value={
                      Math.round((selectedAnnotation.width / CM_TO_PT) * 10) /
                      10
                    }
                    onChange={(val) => {
                      if (!val) return;
                      onUpdateAnnotation(selectedAnnotation.id, {
                        width: val * CM_TO_PT,
                      });
                    }}
                  />
                </div>
                <div>
                  <Text className="text-xs text-gray-600 block mb-1">
                    สูง (ซ.ม.):
                  </Text>
                  <InputNumber
                    size="small"
                    min={0.5}
                    max={30}
                    step={0.5}
                    className="w-full"
                    value={
                      Math.round((selectedAnnotation.height / CM_TO_PT) * 10) /
                      10
                    }
                    onChange={(val) => {
                      if (!val) return;
                      onUpdateAnnotation(selectedAnnotation.id, {
                        height: val * CM_TO_PT,
                      });
                    }}
                  />
                </div>
              </div>

              <div>
                <Text className="text-xs text-gray-600 block mb-1">
                  ขนาดฟอนต์ (pt):
                </Text>
                <InputNumber
                  size="small"
                  min={6}
                  max={24}
                  value={selectedAnnotation.size || 9}
                  className="w-24"
                  onChange={(val) =>
                    onUpdateAnnotation(selectedAnnotation.id, {
                      size: val || 9,
                    })
                  }
                />
              </div>

              <div>
                <Text className="text-xs text-gray-600 block mb-1">
                  สีกรอบ/ตัวอักษร:
                </Text>
                <div className="flex flex-wrap items-center gap-2">
                  <ColorPicker
                    value={selectedAnnotation.color || "#c00000"}
                    onChange={(color) => {
                      const hex =
                        typeof color === "string"
                          ? color
                          : color?.toHexString
                            ? color.toHexString()
                            : "#c00000";
                      onUpdateAnnotation(selectedAnnotation.id, { color: hex });
                    }}
                    showText
                  />
                  <Space size={4}>
                    {PRESET_COLORS.map((preset) => (
                      <Button
                        key={preset.value}
                        size="small"
                        style={{
                          backgroundColor: preset.bg,
                          color: preset.text,
                          borderColor:
                            (selectedAnnotation.color || "#c00000") ===
                            preset.value
                              ? "#1890ff"
                              : "transparent",
                          boxShadow:
                            (selectedAnnotation.color || "#c00000") ===
                            preset.value
                              ? "0 0 0 2px #1890ff"
                              : "none",
                        }}
                        onClick={() =>
                          onUpdateAnnotation(selectedAnnotation.id, {
                            color: preset.value,
                          })
                        }
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </Space>
                </div>
              </div>

              {/* วันที่/เวลา ปัจจุบัน + ปุ่มอัปเดตเป็นเวลาปัจจุบัน */}
              <div className="p-2 bg-white rounded border flex items-center justify-between gap-2">
                <Text className="text-[11px] text-gray-600">
                  วันที่/เวลา: {selectedAnnotation.dateText}{" "}
                  {selectedAnnotation.timeText}
                </Text>
                <Button
                  size="small"
                  onClick={() =>
                    onUpdateAnnotation(selectedAnnotation.id, {
                      dateText: getStampDateText(),
                      timeText: getStampTimeText(),
                    })
                  }
                >
                  ใช้เวลาปัจจุบัน
                </Button>
              </div>
            </div>
          ) : (
            <div className="mb-3 space-y-2">
              {/* แสดงตัวอย่างรูปภาพและขนาด */}
              {signatureCache &&
                signatureCache[selectedAnnotation.sigId]?.dataUrl && (
                  <div className="p-1.5 bg-white rounded border flex items-center gap-2">
                    <img
                      src={signatureCache[selectedAnnotation.sigId].dataUrl}
                      alt="ลายเซ็นต์"
                      className="max-h-10 max-w-[100px] object-contain border bg-gray-50 rounded"
                    />
                    <div className="text-[11px] text-gray-500">
                      <div>
                        ต้นฉบับ:{" "}
                        {signatureCache[selectedAnnotation.sigId].width} ×{" "}
                        {signatureCache[selectedAnnotation.sigId].height} px
                      </div>
                      <div className="text-emerald-700 font-medium">
                        บนเอกสาร:{" "}
                        {Math.round(
                          signatureCache[selectedAnnotation.sigId].width *
                            (selectedAnnotation.scale || 0.3) *
                            10,
                        ) / 10}{" "}
                        ×{" "}
                        {Math.round(
                          signatureCache[selectedAnnotation.sigId].height *
                            (selectedAnnotation.scale || 0.3) *
                            10,
                        ) / 10}{" "}
                        pt
                      </div>
                    </div>
                  </div>
                )}

              {/* ปรับสเกลลายเซ็น */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Text className="text-xs text-gray-600">
                    อัตราส่วนขยาย (Scale):
                  </Text>
                  <span className="text-xs font-mono font-bold text-emerald-600">
                    x{selectedAnnotation.scale || 0.3} (
                    {Math.round((selectedAnnotation.scale || 0.3) * 100)}%)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Slider
                    min={0.05}
                    max={3.0}
                    step={0.05}
                    value={selectedAnnotation.scale || 0.3}
                    onChange={(val) =>
                      onUpdateAnnotation(selectedAnnotation.id, { scale: val })
                    }
                    className="flex-1 !m-0"
                  />
                  <InputNumber
                    size="small"
                    min={0.05}
                    max={3.0}
                    step={0.05}
                    value={selectedAnnotation.scale || 0.3}
                    className="w-20"
                    onChange={(val) =>
                      onUpdateAnnotation(selectedAnnotation.id, {
                        scale: val || 0.3,
                      })
                    }
                  />
                </div>
              </div>

              {/* ปุ่มลัดปรับสเกลด่วน */}
              <div className="flex items-center justify-between gap-1">
                <Button
                  size="small"
                  icon={<CompressOutlined />}
                  className="text-[11px] flex-1 px-1"
                  onClick={() => {
                    const cur = selectedAnnotation.scale || 0.3;
                    const next = Math.max(
                      0.05,
                      Math.round((cur - 0.05) * 100) / 100,
                    );
                    onUpdateAnnotation(selectedAnnotation.id, { scale: next });
                  }}
                  title="ลดลง 5%"
                >
                  -5%
                </Button>
                <Button
                  size="small"
                  icon={<CompressOutlined />}
                  className="text-[11px] flex-1 px-1"
                  onClick={() => {
                    const cur = selectedAnnotation.scale || 0.3;
                    const next = Math.max(
                      0.05,
                      Math.round((cur - 0.1) * 100) / 100,
                    );
                    onUpdateAnnotation(selectedAnnotation.id, { scale: next });
                  }}
                  title="ลดลง 10%"
                >
                  -10%
                </Button>
                <Button
                  size="small"
                  icon={<ExpandOutlined />}
                  className="text-[11px] flex-1 px-1"
                  onClick={() => {
                    const cur = selectedAnnotation.scale || 0.3;
                    const next = Math.min(
                      3.0,
                      Math.round((cur + 0.05) * 100) / 100,
                    );
                    onUpdateAnnotation(selectedAnnotation.id, { scale: next });
                  }}
                  title="ขยายขึ้น 5%"
                >
                  +5%
                </Button>
                <Button
                  size="small"
                  icon={<ExpandOutlined />}
                  className="text-[11px] flex-1 px-1"
                  onClick={() => {
                    const cur = selectedAnnotation.scale || 0.3;
                    const next = Math.min(
                      3.0,
                      Math.round((cur + 0.1) * 100) / 100,
                    );
                    onUpdateAnnotation(selectedAnnotation.id, { scale: next });
                  }}
                  title="ขยายขึ้น 10%"
                >
                  +10%
                </Button>
              </div>

              {/* ปรับขนาดตามความกว้าง / สูง เป็น Point (pt) แบบล็อกสัดส่วน */}
              {signatureCache &&
                signatureCache[selectedAnnotation.sigId]?.width && (
                  <div className="p-2 bg-emerald-50/60 rounded border border-emerald-200">
                    <Text className="text-[11px] text-emerald-800 font-medium flex items-center gap-1 mb-1.5">
                      <LinkOutlined /> ระบุขนาดเจาะจง (pt - ล็อกสัดส่วน):
                    </Text>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Text className="text-[10px] text-gray-500 block mb-0.5">
                          กว้าง (Width pt):
                        </Text>
                        <InputNumber
                          size="small"
                          min={10}
                          max={1000}
                          precision={1}
                          value={
                            Math.round(
                              signatureCache[selectedAnnotation.sigId].width *
                                (selectedAnnotation.scale || 0.3) *
                                10,
                            ) / 10
                          }
                          onChange={(val) => {
                            if (!val) return;
                            const natW =
                              signatureCache[selectedAnnotation.sigId].width;
                            const newScale = Math.max(
                              0.05,
                              Math.min(
                                3.0,
                                Math.round((val / natW) * 100) / 100,
                              ),
                            );
                            onUpdateAnnotation(selectedAnnotation.id, {
                              scale: newScale,
                            });
                          }}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Text className="text-[10px] text-gray-500 block mb-0.5">
                          สูง (Height pt):
                        </Text>
                        <InputNumber
                          size="small"
                          min={5}
                          max={1000}
                          precision={1}
                          value={
                            Math.round(
                              signatureCache[selectedAnnotation.sigId].height *
                                (selectedAnnotation.scale || 0.3) *
                                10,
                            ) / 10
                          }
                          onChange={(val) => {
                            if (!val) return;
                            const natH =
                              signatureCache[selectedAnnotation.sigId].height;
                            const newScale = Math.max(
                              0.05,
                              Math.min(
                                3.0,
                                Math.round((val / natH) * 100) / 100,
                              ),
                            );
                            onUpdateAnnotation(selectedAnnotation.id, {
                              scale: newScale,
                            });
                          }}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* ปุ่มลบรายการนี้ */}
          <Button
            danger
            block
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => onDeleteAnnotation(selectedAnnotation.id)}
          >
            ลบจุดนี้
          </Button>
        </div>
      ) : (
        <div className="my-3 p-2.5 bg-gray-50 rounded-md border text-xs text-gray-500 flex items-center justify-between">
          <span>พิกัดล่าสุดที่คลิก:</span>
          {lastClickedCoord ? (
            <Tag color="blue" className="m-0 font-mono">
              หน้า {lastClickedCoord.page} | X: {lastClickedCoord.x.toFixed(1)},
              Y: {lastClickedCoord.y.toFixed(1)}
            </Tag>
          ) : (
            <span className="text-gray-400">ยังไม่ได้คลิกเลือก</span>
          )}
        </div>
      )}

      {/* รายการเตรียมบันทึก (List Management) */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <Text className="text-xs font-semibold text-gray-700">
            รายการเตรียมบันทึก ({totalCount} จุด):
          </Text>
          <Segmented
            size="small"
            value={listFilter}
            onChange={setListFilter}
            options={[
              { label: `หน้านี้ (${currentCount})`, value: "current" },
              { label: `ทั้งหมด (${totalCount})`, value: "all" },
            ]}
          />
        </div>

        {displayAnnotations.length === 0 ? (
          <div className="p-3 bg-gray-50 rounded border text-center text-xs text-gray-400">
            ยังไม่มีรายการในหน้านี้
          </div>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {displayAnnotations.map((item, index) => {
              const isSelected = item.id === selectedId;
              const isText = item.type === "text";
              const isStamp = item.type === "stamp";

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectAnnotation(item.id)}
                  className={`p-2 rounded border text-xs flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? "bg-blue-100/70 border-blue-500 shadow-sm"
                      : "bg-white hover:bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-2">
                    <span className="text-gray-400 font-mono text-[10px]">
                      #{index + 1}
                    </span>
                    <Tag
                      color={isText ? "blue" : isStamp ? "red" : "green"}
                      className="m-0 text-[10px] px-1 py-0"
                    >
                      {isText ? "ข้อความ" : isStamp ? "ตราประทับ" : "ลายเซ็น"}
                    </Tag>
                    {(isText || isStamp) && (
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full border border-gray-300 flex-shrink-0"
                        style={{ backgroundColor: item.color || "#000000" }}
                        title={`สี: ${item.color || "#000000"}`}
                      />
                    )}
                    {item.pageIndex !== currentPageIndex && (
                      <Tag color="purple" className="m-0 text-[10px] px-1 py-0">
                        น.{item.pageIndex + 1}
                      </Tag>
                    )}
                    <span className="truncate font-medium text-gray-800">
                      {isText
                        ? item.content
                        : isStamp
                          ? `เลขรับ ${item.receiptNo || "-"} • ${item.dateText} ${item.timeText}`
                          : `ID: ${item.sigId.slice(0, 8)}... (x${item.scale || 0.3})`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-[10px] font-mono text-gray-400">
                      ({item.x.toFixed(0)}, {item.y.toFixed(0)})
                    </span>
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined className="text-xs" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteAnnotation(item.id);
                      }}
                      title="ลบรายการนี้"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {annotations.length > 0 && (
          <div className="mt-2 flex justify-end">
            <Popconfirm
              title="ยืนยันการล้างรายการทั้งหมด?"
              onConfirm={onClearAnnotations}
              okText="ล้างทั้งหมด"
              cancelText="ยกเลิก"
            >
              <Button size="small" type="link" danger icon={<ClearOutlined />}>
                ล้างทั้งหมด
              </Button>
            </Popconfirm>
          </div>
        )}
      </div>

      {/* ปุ่มบันทึกทับไฟล์เดิม */}
      <Button
        type="primary"
        danger
        icon={<SaveOutlined />}
        size="large"
        block
        onClick={onSave}
        loading={saving}
        disabled={annotations.length === 0}
      >
        บันทึกทับไฟล์เดิม ({annotations.length} จุด)
      </Button>
    </Card>
  );
};

export default ControlPanel;

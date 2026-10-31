import { useEffect, useRef, useState } from "react";
import {
  Card,
  Button,
  Space,
  Typography,
  Empty,
  Spin,
  Tooltip,
  Pagination,
  InputNumber,
} from "antd";
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  CloseCircleFilled,
  HolderOutlined,
} from "@ant-design/icons";
import {
  getTextAnnotationBox,
  TEXT_LINE_HEIGHT_FACTOR,
  buildStampLines,
  CM_TO_PT,
} from "../utils/pdfHelper";

// เรียกใช้ PDF.js จาก CDN
const pdfjsLib = window.pdfjsLib;
if (pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

const { Text } = Typography;

const PdfViewerCanvas = ({
  pdfDocJs,
  currentPage,
  setCurrentPage,
  totalPages,
  onCanvasClick,
  annotations,
  selectedId,
  onSelectAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  mode,
  loading,
  signatureCache,
  fontBytes,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1.2);
  const [viewportInfo, setViewportInfo] = useState({
    width: 0,
    height: 0,
    scale: 1.2,
  });
  const [draggingId, setDraggingId] = useState(null);
  const [jumpPage, setJumpPage] = useState(1);

  // ซิงก์ช่อง "ไปหน้าที่" ให้ตรงกับหน้าปัจจุบันเสมอ
  useEffect(() => {
    setJumpPage(currentPage);
  }, [currentPage]);

  const goToPage = (page) => {
    const target = Math.min(Math.max(1, page), totalPages || 1);
    setCurrentPage(target);
    onSelectAnnotation(null);
    setJumpPage(target);
  };

  // เรนเดอร์หน้า PDF ลงบน Canvas
  useEffect(() => {
    if (!pdfDocJs) return;

    let renderTask = null;
    let isCancelled = false;

    const renderPage = async () => {
      try {
        const page = await pdfDocJs.getPage(currentPage);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        setViewportInfo({
          width: viewport.width,
          height: viewport.height,
          scale: viewport.scale,
          pageWidth: viewport.width / viewport.scale,
          pageHeight: viewport.height / viewport.scale,
        });

        renderTask = page.render({ canvasContext: ctx, viewport });
        await renderTask.promise;
      } catch (err) {
        if (err && err.name !== "RenderingCancelledException") {
          console.error("Error rendering page:", err);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTask) renderTask.cancel();
    };
  }, [pdfDocJs, currentPage, scale]);

  // ดักจับ Keyboard shortcuts (กดลูกศรเลื่อนตำแหน่ง, Delete/Backspace เพื่อลบ)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedId) return;

      const tag = e.target.tagName ? e.target.tagName.toLowerCase() : "";
      if (tag === "input" || tag === "textarea") return;

      const step = e.shiftKey ? 5 : 1;
      const target = annotations.find((a) => a.id === selectedId);
      if (!target) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onUpdateAnnotation(selectedId, {
          x: Math.max(0, Math.round((target.x - step) * 10) / 10),
        });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onUpdateAnnotation(selectedId, {
          x: Math.round((target.x + step) * 10) / 10,
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        onUpdateAnnotation(selectedId, {
          y: Math.round((target.y + step) * 10) / 10,
        });
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        onUpdateAnnotation(selectedId, {
          y: Math.max(0, Math.round((target.y - step) * 10) / 10),
        });
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        onDeleteAnnotation(selectedId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, annotations, onUpdateAnnotation, onDeleteAnnotation]);

  // ดักจับการคลิกบน Canvas ว่างๆ เพื่อวาง Marker
  const handleContainerClick = async (e) => {
    if (!pdfDocJs || !canvasRef.current || draggingId) return;

    if (e.target.closest(".annotation-marker")) return;

    if (mode === "select") {
      onSelectAnnotation(null);
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const page = await pdfDocJs.getPage(currentPage);
    const viewport = page.getViewport({ scale });
    const currentScale = viewport.scale;

    // คำนวณพิกัด PDF-lib (มุมซ้ายล่างคือ 0,0)
    const pdfX = Math.round((clickX / currentScale) * 10) / 10;
    const pdfY =
      Math.round(((viewport.height - clickY) / currentScale) * 10) / 10;

    onCanvasClick({ pdfX, pdfY, currentPage });
  };

  // ลากเพื่อปรับตำแหน่ง Marker แบบ Pointer Events
  const handlePointerDown = (item, e) => {
    e.stopPropagation();
    e.preventDefault();

    onSelectAnnotation(item.id);
    setDraggingId(item.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const initPdfX = item.x;
    const initPdfY = item.y;
    const curScale = viewportInfo.scale || scale;
    const pWidth = viewportInfo.pageWidth || 600;
    const pHeight = viewportInfo.pageHeight || 800;

    const onPointerMove = (moveEvt) => {
      const deltaScreenX = moveEvt.clientX - startX;
      const deltaScreenY = moveEvt.clientY - startY;

      // ใน PDF: X เพิ่มไปขวา, Y เพิ่มขึ้นด้านบน
      const deltaPdfX = deltaScreenX / curScale;
      const deltaPdfY = -deltaScreenY / curScale;

      let newPdfX = Math.round((initPdfX + deltaPdfX) * 10) / 10;
      let newPdfY = Math.round((initPdfY + deltaPdfY) * 10) / 10;

      newPdfX = Math.max(0, Math.min(pWidth, newPdfX));
      newPdfY = Math.max(0, Math.min(pHeight, newPdfY));

      onUpdateAnnotation(item.id, { x: newPdfX, y: newPdfY });
    };

    const onPointerUp = () => {
      setDraggingId(null);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const currentPageIndex = currentPage - 1;
  const pageAnnotations = annotations.filter(
    (a) => a.pageIndex === currentPageIndex,
  );

  return (
    <Card className="w-full flex flex-col items-center justify-center min-h-[600px] shadow-md rounded-lg">
      {loading ? (
        <Spin tip="กำลังโหลดไฟล์ PDF..." size="large" />
      ) : pdfDocJs ? (
        <div className="flex flex-col items-center w-full">
          {/* แถบควบคุมหน้าและการซูม */}
          <div className="flex flex-wrap items-center justify-between w-full max-w-3xl mb-4 px-2">
            <Space wrap>
              <Pagination
                current={currentPage}
                total={totalPages}
                pageSize={1}
                size="small"
                showSizeChanger={false}
                showTotal={(total, range) => `หน้า ${range[0]} / ${total}`}
                onChange={goToPage}
              />
              <Space.Compact>
                <Tooltip title="ระบุเลขหน้าที่ต้องการแสดง">
                  <Button
                    size="small"
                    onClick={() => goToPage(Number(jumpPage))}
                  >
                    ไปหน้าที่
                  </Button>
                  <InputNumber
                    min={1}
                    max={totalPages}
                    value={jumpPage}
                    size="small"
                    style={{ width: 90 }}
                    placeholder="เลขหน้า"
                    onChange={(val) => setJumpPage(val || 1)}
                    onPressEnter={() => goToPage(Number(jumpPage))}
                  />
                </Tooltip>
              </Space.Compact>
            </Space>

            <Space>
              <Tooltip title="ย่อขนาด">
                <Button
                  icon={<ZoomOutOutlined />}
                  size="small"
                  disabled={scale <= 0.8}
                  onClick={() =>
                    setScale((s) =>
                      Math.max(0.8, Math.round((s - 0.2) * 10) / 10),
                    )
                  }
                />
              </Tooltip>
              <Text className="text-xs text-gray-500 font-mono">
                {Math.round(scale * 100)}%
              </Text>
              <Tooltip title="ขยายขนาด">
                <Button
                  icon={<ZoomInOutlined />}
                  size="small"
                  disabled={scale >= 2.0}
                  onClick={() =>
                    setScale((s) =>
                      Math.min(2.0, Math.round((s + 0.2) * 10) / 10),
                    )
                  }
                />
              </Tooltip>
            </Space>
          </div>

          {/* เอกสาร PDF และ Layer การวาง Marker ที่ปรับตำแหน่งได้ */}
          <div
            ref={containerRef}
            onClick={handleContainerClick}
            className="relative border border-gray-300 shadow-lg overflow-hidden rounded select-none bg-white"
            style={{
              width: viewportInfo.width || "auto",
              height: viewportInfo.height || "auto",
              cursor: mode === "select" ? "default" : "crosshair",
            }}
          >
            <canvas ref={canvasRef} style={{ display: "block" }} />

            {/* Overlays: เรนเดอร์ตัวข้อความและรูปภาพลายเซ็นต์จริง */}
            {viewportInfo.width > 0 &&
              pageAnnotations.map((item) => {
                const isSelected = item.id === selectedId;
                const isDragging = draggingId === item.id;
                const curScale = viewportInfo.scale || scale;

                const domLeft = item.x * curScale;
                const domBottom = viewportInfo.height - item.y * curScale;
                const isText = item.type === "text";
                const isStamp = item.type === "stamp";

                // คำนวณกล่องข้อความให้ตรงกับ pdf-lib (เห็นครบทุกบรรทัด + ขนาดฟอนต์ตามที่เลือก)
                const textBox = isText
                  ? getTextAnnotationBox(item, fontBytes)
                  : null;

                // ข้อความ 3 บรรทัดของตราประทับรับ
                const stampLines = isStamp ? buildStampLines(item) : null;

                // ดึงข้อมูลรูปภาพลายเซ็นจาก cache
                const sigData =
                  !isText && !isStamp && signatureCache
                    ? signatureCache[item.sigId]
                    : null;
                let sigWidth = null;
                let sigHeight = null;
                if (
                  !isText &&
                  !isStamp &&
                  sigData &&
                  sigData.width &&
                  sigData.height
                ) {
                  sigWidth = sigData.width * (item.scale || 0.3) * curScale;
                  sigHeight = sigData.height * (item.scale || 0.3) * curScale;
                }

                return (
                  <div
                    key={item.id}
                    className={`annotation-marker absolute ${
                      isSelected ? "z-30" : "z-20 hover:z-25"
                    }`}
                    style={{
                      left: isText
                        ? `${textBox.x * curScale}px`
                        : `${domLeft}px`,
                      top: isText
                        ? `${viewportInfo.height - (textBox.y + textBox.height) * curScale}px`
                        : isStamp
                          ? `${viewportInfo.height - (item.y + item.height) * curScale}px`
                          : `${domBottom}px`,
                      /* ข้อความ/ตราประทับ: ใช้กล่องที่คำนวณมาแล้ว (ตรงกับ PDF)
                         ลายเซ็น: เลื่อนขึ้นเต็มความสูง (มุมซ้ายล่างตรงจุด anchor) */
                      transform:
                        isText || isStamp ? "none" : "translate(0, -100%)",
                      width: isText
                        ? `${textBox.width * curScale}px`
                        : isStamp
                          ? `${item.width * curScale}px`
                          : sigWidth
                            ? `${sigWidth}px`
                            : "auto",
                      height: isText
                        ? `${textBox.height * curScale}px`
                        : isStamp
                          ? `${item.height * curScale}px`
                          : sigHeight
                            ? `${sigHeight}px`
                            : "auto",
                      cursor: isDragging ? "grabbing" : "grab",
                    }}
                    onPointerDown={(e) => handlePointerDown(item, e)}
                  >
                    {/* กรณีข้อความ: เรนเดอร์ข้อความจริงตามขนาดฟอนต์และครบทุกบรรทัด */}
                    {isText ? (
                      <div
                        className={`w-full h-full rounded-sm transition-shadow select-none ${
                          isSelected
                            ? "ring-2 ring-blue-500 bg-blue-50/40"
                            : "hover:ring-1 hover:ring-blue-400 hover:bg-blue-50/20"
                        }`}
                        style={{
                          fontSize: `${(item.size || 16) * curScale}px`,
                          lineHeight: TEXT_LINE_HEIGHT_FACTOR,
                          fontFamily:
                            "'Sarabun', 'THSarabunNew', -apple-system, sans-serif",
                          color: item.color || "#000000",
                          whiteSpace: "pre",
                          overflow: "visible",
                          boxSizing: "border-box",
                        }}
                      >
                        {item.content}
                      </div>
                    ) : isStamp ? (
                      /* กรณีตราประทับรับ: กรอบสี่เหลี่ยม + ข้อความ 3 บรรทัดจัดกึ่งกลาง */
                      <div
                        className={`w-full h-full rounded-sm transition-shadow select-none ${
                          isSelected
                            ? "ring-2 ring-rose-500 bg-rose-50/30"
                            : "hover:ring-1 hover:ring-rose-400 hover:bg-rose-50/20"
                        }`}
                        style={{
                          border: `${Math.max(1, 1 * curScale)}px solid ${item.color || "#c00000"}`,
                          color: item.color || "#c00000",
                          fontSize: `${(item.size || 9) * curScale}px`,
                          lineHeight: TEXT_LINE_HEIGHT_FACTOR,
                          fontFamily:
                            "'Sarabun', 'THSarabunNew', -apple-system, sans-serif",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          whiteSpace: "pre",
                          boxSizing: "border-box",
                          overflow: "hidden",
                        }}
                      >
                        {stampLines.join("\n")}
                      </div>
                    ) : (
                      /* กรณีลายเซ็น: เรนเดอร์รูปภาพลายเซ็นจริงตามอัตราส่วน */
                      <div
                        className={`w-full h-full rounded transition-all select-none ${
                          isSelected
                            ? "ring-2 ring-emerald-500 bg-emerald-50/30 border border-dashed border-emerald-600 shadow-md"
                            : "hover:ring-1 hover:ring-emerald-400 hover:bg-emerald-50/10"
                        }`}
                      >
                        {sigData && sigData.dataUrl ? (
                          <div className="flex flex-col items-center w-full h-full">
                            <img
                              src={sigData.dataUrl}
                              alt="ลายเซ็นต์"
                              className="w-full h-full object-contain pointer-events-none select-none"
                              style={{ display: "block" }}
                              draggable={false}
                            />
                            {item.showDate && item.dateText && (
                              <div
                                className="mt-0.5 text-center text-black select-none"
                                style={{
                                  fontSize: `${9 * 0.9 * curScale}px`,
                                  lineHeight: 1.1,
                                  fontFamily:
                                    "'Sarabun', 'THSarabunNew', -apple-system, sans-serif",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {item.dateText}
                              </div>
                            )}
                          </div>
                        ) : sigData && sigData.loading ? (
                          <div className="p-2 bg-emerald-50/90 border border-emerald-400 rounded flex items-center gap-1.5 text-xs text-emerald-800 shadow">
                            <Spin size="small" />
                            <span>กำลังโหลดรูปภาพลายเซ็นต์...</span>
                          </div>
                        ) : sigData && sigData.error ? (
                          <div className="p-1 bg-red-50 border border-red-300 rounded text-xs text-red-600 shadow">
                            ❌ ไม่สามารถโหลดรูปภาพลายเซ็นได้
                          </div>
                        ) : (
                          <div className="p-2 bg-emerald-50/90 border-2 border-dashed border-emerald-500 rounded text-xs font-mono text-emerald-900 shadow">
                            ✍️ ลายเซ็นต์ [ID:{" "}
                            {item.sigId ? item.sigId.slice(0, 8) + "..." : ""}]
                          </div>
                        )}
                      </div>
                    )}

                    {/* จุด Anchor Pin (แสดงจุดพิกัด PDF-lib) */}
                    <div
                      className={`absolute w-3 h-3 rounded-full border-2 border-white shadow-md ${
                        isText
                          ? "bg-blue-600"
                          : isStamp
                            ? "bg-rose-600"
                            : "bg-emerald-600"
                      } ${isSelected ? "ring-2 ring-blue-300 scale-125" : ""}`}
                      style={{
                        left: "-6px",
                        /* ข้อความ: วางที่ baseline บรรทัดแรก (item.y) / ลายเซ็น: มุมซ้ายล่างของกล่อง */
                        ...(isText
                          ? {
                              top: `${(item.size || 16) * 0.8 * curScale - 6}px`,
                            }
                          : { bottom: "-6px" }),
                      }}
                      title={`พิกัด PDF: X=${item.x.toFixed(1)}, Y=${item.y.toFixed(1)}`}
                    />

                    {/* กล่องเครื่องมือลอยตัวเมื่อถูกเลือก */}
                    {isSelected && (
                      <div
                        className={`absolute -top-7 left-0 flex items-center gap-1.5 text-white text-[11px] font-medium px-2 py-0.5 rounded shadow-lg whitespace-nowrap pointer-events-auto ${
                          isText
                            ? "bg-blue-600"
                            : isStamp
                              ? "bg-rose-600"
                              : "bg-emerald-600"
                        }`}
                        style={{ zIndex: 40 }}
                      >
                        <HolderOutlined className="cursor-grab active:cursor-grabbing opacity-80" />
                        {isText ? (
                          <>
                            <span
                              className="inline-block w-2.5 h-2.5 rounded-full border border-white/60"
                              style={{
                                backgroundColor: item.color || "#000000",
                              }}
                            />
                            <span>ข้อความ ({item.size}pt)</span>
                          </>
                        ) : isStamp ? (
                          <>
                            <span
                              className="inline-block w-2.5 h-2.5 rounded-sm border border-white/60"
                              style={{
                                backgroundColor: item.color || "#c00000",
                              }}
                            />
                            <span>
                              ตราประทับรับ (
                              {Math.round((item.width / CM_TO_PT) * 10) / 10}×
                              {Math.round((item.height / CM_TO_PT) * 10) / 10}{" "}
                              ซม.)
                            </span>
                          </>
                        ) : (
                          <span>
                            ลายเซ็น (x{item.scale} ={" "}
                            {Math.round((item.scale || 0.3) * 100)}%)
                          </span>
                        )}
                        <span className="font-mono opacity-80 text-[10px]">
                          X:{item.x.toFixed(0)}, Y:{item.y.toFixed(0)}
                        </span>
                        <button
                          type="button"
                          className="ml-1 text-white hover:text-red-200 p-0.5 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteAnnotation(item.id);
                          }}
                          title="ลบจุดนี้"
                        >
                          <CloseCircleFilled className="text-xs" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          <div className="mt-3 text-xs text-gray-500 text-center">
            💡 คลิกแล้วลากที่ข้อความ/ลายเซ็น/ตราประทับเพื่อย้ายตำแหน่งได้ทันที
            หรือกดปุ่มลูกศร (▲ ▼ ◄ ►) บนคีย์บอร์ดเพื่อเลื่อนตำแหน่ง
          </div>
        </div>
      ) : (
        <Empty description="กรุณากรอก PDF File ID แล้วกดเปิดไฟล์" />
      )}
    </Card>
  );
};

export default PdfViewerCanvas;

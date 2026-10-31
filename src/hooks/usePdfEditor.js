import { useEffect, useState } from "react";
import { Form, message, notification } from "antd";
import * as PDFLib from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import * as pdfjsLib from "pdfjs-dist";

import { callGas, parseGasResult } from "../utils/gasApi";
import {
  base64ToUint8Array,
  uint8ArrayToBase64Async,
  hexToPdfRgb,
  TEXT_LINE_HEIGHT_FACTOR,
  cmToPt,
  buildStampLines,
  getStampDateText,
  getStampTimeText,
  getStampFirstBaseline,
} from "../utils/pdfHelper";

/**
 * usePdfEditor
 * รวม state และตรรกะทั้งหมดของ PDF Interactive Editor ไว้ที่เดียว
 * เพื่อให้ยกไปใช้ใน project อื่นได้โดยไม่ต้องคัดลอกทั้ง App
 *
 * วิธีใช้:
 *   const editor = usePdfEditor();
 *   <Form form={editor.form}>...</Form>
 *   <ControlPanel form={editor.form} onLoadPdf={editor.onLoadPdf} ... />
 *   <PdfViewerCanvas pdfDocJs={editor.pdfDocJs} ... fontBytes={editor.fontBytes} />
 *
 * dependencies ที่ต้องมีในโปรเจกต์ปลายทาง:
 *   antd, @ant-design/icons, pdf-lib, @pdf-lib/fontkit, pdfjs-dist
 *   + gas backend functions: getPdfAsBase64, getSignatureAsDataUrl,
 *     getThaiFontBase64, overwritePdf (ดู gas/code.js)
 */
export const usePdfEditor = (options = {}) => {
  const {
    initialPdfId = "",
    initialSigId = "",
    initialMode = "text",
    useConfig = true,
    autoLoad = false,
    onSaved,
  } = options;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [rawPdfBytes, setRawPdfBytes] = useState(null);
  const [fontBytesThai, setFontBytesThai] = useState(null);
  const [pdfDocJs, setPdfDocJs] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [mode, setMode] = useState(initialMode);

  const [annotations, setAnnotations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [lastClickedCoord, setLastClickedCoord] = useState(null);
  const [signatureCache, setSignatureCache] = useState({});

  // ดึงไฟล์รูปภาพลายเซ็นจาก Google Drive และเก็บ Cache
  const fetchSignatureImage = async (sigId) => {
    if (!sigId) return null;
    if (signatureCache[sigId] && signatureCache[sigId].dataUrl) {
      return signatureCache[sigId];
    }

    setSignatureCache((prev) => ({
      ...prev,
      [sigId]: { loading: true },
    }));

    try {
      const dataUrl = await callGas("getSignatureAsDataUrl", sigId);
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("ไม่สามารถประมวลผลไฟล์รูปภาพได้"));
        img.src = dataUrl;
      });

      const result = {
        dataUrl,
        width: img.naturalWidth || 200,
        height: img.naturalHeight || 80,
        loading: false,
      };

      setSignatureCache((prev) => ({
        ...prev,
        [sigId]: result,
      }));

      return result;
    } catch (err) {
      console.error("[fetchSignatureImage] Error:", err);
      setSignatureCache((prev) => ({
        ...prev,
        [sigId]: { loading: false, error: err.message || String(err) },
      }));
      message.error({
        content: `โหลดภาพลายเซ็นไม่สำเร็จ: ${err.message || err}`,
        key: "sig_" + sigId,
      });
      return null;
    }
  };

  // โหลดเอกสาร PDF
  const handleLoadPdf = async (values) => {
    const { pdfId } = values;
    console.log("[handleLoadPdf] called with pdfId:", pdfId);
    setLoading(true);
    setAnnotations([]);
    setSelectedId(null);

    try {
      // 1. ดึงไฟล์ PDF จาก Google Drive
      message.loading({ content: "กำลังโหลดไฟล์ PDF...", key: "pdf" });
      const pdfBase64 = await callGas("getPdfAsBase64", pdfId);
      const bytes = base64ToUint8Array(pdfBase64);
      setRawPdfBytes(bytes);

      // 2. โหลดลง PDF.js Viewer
      const buffer = bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength,
      );
      const docJs = await pdfjsLib.getDocument({ data: buffer }).promise;

      setPdfDocJs(docJs);
      setTotalPages(docJs.numPages);
      setCurrentPage(1);

      message.success({ content: "เปิดไฟล์ PDF เรียบร้อยแล้ว", key: "pdf" });

      // 3. โหลดฟอนต์ภาษาไทยล่วงหน้าใน background เพื่อเตรียมพร้อมสำหรับตอนบันทึก
      if (!fontBytesThai) {
        callGas("getThaiFontBase64")
          .then((fontBase64) => {
            const fBytes = base64ToUint8Array(fontBase64);
            setFontBytesThai(fBytes);
            console.log("Thai font preloaded successfully");
          })
          .catch((fontErr) => {
            console.warn(
              "โหลดฟอนต์ภาษาไทยล่วงหน้าไม่สำเร็จ (จะลองใหม่เมื่อกดบันทึก):",
              fontErr,
            );
          });
      }
    } catch (err) {
      console.error("[handleLoadPdf] Error:", err);
      notification.error({
        message: "เกิดข้อผิดพลาดในการเปิดไฟล์ PDF",
        description: err.message || String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  // เติมค่าเริ่มต้นที่ผู้เรียกส่งเข้ามา (เช่น จากปุ่ม "แก้ไข PDF" ในโปรเจกต์แม่)
  // และเปิดไฟล์ทันทีถ้า autoLoad = true
  useEffect(() => {
    const values = {};
    if (initialPdfId) values.pdfId = initialPdfId;
    if (initialSigId) values.sigId = initialSigId;
    if (Object.keys(values).length) form.setFieldsValue(values);
    if (autoLoad && initialPdfId) handleLoadPdf({ pdfId: initialPdfId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // เติม PDF File ID จากค่าที่ตั้งไว้ใน Script Properties (DEFAULT_PDF_ID)
  // และเปิดไฟล์อัตโนมัติถ้า AUTO_OPEN_PDF ไม่ใช่ "false"
  useEffect(() => {
    if (!useConfig) return undefined;
    let cancelled = false;
    callGas("getPdfEditorConfig")
      .then((raw) => {
        if (cancelled) return;
        const cfg = parseGasResult(raw);
        const pdfId = (cfg && cfg.defaultPdfId) || "";
        if (!pdfId) return;
        if (!form.getFieldValue("pdfId")) {
          form.setFieldsValue({ pdfId });
        }
        if (cfg.autoOpen) {
          handleLoadPdf({ pdfId });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ดักจับการคลิกบน Canvas
  const handleCanvasClick = ({ pdfX, pdfY, currentPage: page }) => {
    setLastClickedCoord({ page, x: pdfX, y: pdfY });

    if (mode === "select") {
      setSelectedId(null);
      return;
    }

    const formValues = form.getFieldsValue();
    const newId = `ann_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    if (mode === "text") {
      const text = formValues.thaiText;
      const size = formValues.fontSize || 16;
      const rawColor = formValues.textColor;
      const color =
        typeof rawColor === "string"
          ? rawColor
          : rawColor?.toHexString
            ? rawColor.toHexString()
            : "#000000";
      if (!text) return message.warning("กรุณากรอกข้อความภาษาไทยก่อนคลิกวาง");

      const newAnnotation = {
        id: newId,
        pageIndex: page - 1,
        type: "text",
        x: pdfX,
        y: pdfY,
        content: text,
        size,
        color: color || "#000000",
      };

      setAnnotations((prev) => [...prev, newAnnotation]);
      setSelectedId(newId);
      message.info(
        `วางข้อความ "${text}" เรียบร้อย (สามารถคลิกลากปรับตำแหน่งได้)`,
      );
    } else if (mode === "signature") {
      const sigId = formValues.sigId;
      const scale = formValues.sigScale || 0.3;
      const showSigDate = Boolean(formValues.showSigDate);
      const sigDateText = (formValues.sigDateText || getStampDateText()).trim();

      if (!sigId)
        return message.warning("กรุณากรอก Signature Image File ID ก่อนคลิกวาง");

      // เริ่มโหลดรูปภาพลายเซ็นทันทีเพื่อให้เรนเดอร์ภาพจริงบนเอกสาร
      fetchSignatureImage(sigId);

      const newAnnotation = {
        id: newId,
        pageIndex: page - 1,
        type: "signature",
        x: pdfX,
        y: pdfY,
        sigId,
        scale,
        showDate: showSigDate,
        dateText: showSigDate ? sigDateText : "",
      };

      setAnnotations((prev) => [...prev, newAnnotation]);
      setSelectedId(newId);
      message.info("วางลายเซ็นต์เรียบร้อย (สามารถคลิกลากปรับตำแหน่งได้)");
    } else if (mode === "stamp") {
      const receiptNo = (formValues.stampReceiptNo || "").trim();
      const width = cmToPt(formValues.stampWidth || 5);
      const height = cmToPt(formValues.stampHeight || 2.5);
      const size = formValues.stampFontSize || 9;
      const rawColor = formValues.stampColor;
      const color =
        typeof rawColor === "string"
          ? rawColor
          : rawColor?.toHexString
            ? rawColor.toHexString()
            : "#c00000";

      const newAnnotation = {
        id: newId,
        pageIndex: page - 1,
        type: "stamp",
        // วางให้จุดที่คลิกเป็นกึ่งกลางของตราประทับ
        x: Math.max(0, pdfX - width / 2),
        y: Math.max(0, pdfY - height / 2),
        width,
        height,
        receiptNo,
        dateText: getStampDateText(),
        timeText: getStampTimeText(),
        size,
        color: color || "#c00000",
      };

      setAnnotations((prev) => [...prev, newAnnotation]);
      setSelectedId(newId);
      message.info("วางตราประทับรับเรียบร้อย (สามารถคลิกลากปรับตำแหน่งได้)");
    }
  };

  // เลือกรายการและสลับหน้าให้อัตโนมัติหากอยู่คนละหน้า
  const handleSelectAnnotation = (id) => {
    setSelectedId(id);
    if (id) {
      const target = annotations.find((a) => a.id === id);
      if (target && target.pageIndex + 1 !== currentPage) {
        setCurrentPage(target.pageIndex + 1);
      }
    }
  };

  // ปรับแก้ข้อมูลหรือพิกัดของ Annotation
  const handleUpdateAnnotation = (id, updates) => {
    setAnnotations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  };

  // ลบ Annotation ทีละรายการ
  const handleDeleteAnnotation = (id) => {
    setAnnotations((prev) => prev.filter((item) => item.id !== id));
    if (selectedId === id) setSelectedId(null);
    message.success("ลบจุดวางเรียบร้อย");
  };

  // ล้างรายการทั้งหมด
  const handleClearAnnotations = () => {
    setAnnotations([]);
    setSelectedId(null);
    message.info("ล้างรายการทั้งหมดเรียบร้อย");
  };

  // ประมวลผลและส่งไปบันทึกทับใน Drive
  const handleSave = async () => {
    if (annotations.length === 0)
      return message.warning("กรุณาคลิกวางอย่างน้อย 1 จุด");

    const pdfId = form.getFieldValue("pdfId");
    setSaving(true);

    try {
      // 1. โหลด PDF-lib
      const pdfDoc = await PDFLib.PDFDocument.load(rawPdfBytes, {
        ignoreEncryption: true,
      });
      pdfDoc.registerFontkit(fontkit);

      let fontBytes = fontBytesThai;
      const hasTextAnnotations = annotations.some(
        (a) => a.type === "text" || a.type === "stamp",
      );
      let customThaiFont = null;

      if (hasTextAnnotations) {
        if (!fontBytes) {
          message.loading({ content: "กำลังโหลดฟอนต์ภาษาไทย...", key: "font" });
          const fontBase64 = await callGas("getThaiFontBase64");
          fontBytes = base64ToUint8Array(fontBase64);
          setFontBytesThai(fontBytes);
          message.success({ content: "โหลดฟอนต์สำเร็จ", key: "font" });
        }
        customThaiFont = await pdfDoc.embedFont(fontBytes, { subset: true });
      }

      const pages = pdfDoc.getPages();
      const sigImageMap = new Map();

      // 2. วาดข้อความและลายเซ็นลงบน PDF ตามตำแหน่ง x, y ที่ปรับล่าสุด
      for (const item of annotations) {
        const targetPage = pages[item.pageIndex];

        if (item.type === "text") {
          targetPage.drawText(item.content, {
            x: item.x,
            y: item.y,
            size: item.size,
            font: customThaiFont,
            color: hexToPdfRgb(item.color || "#000000"),
            lineHeight: item.size * TEXT_LINE_HEIGHT_FACTOR,
          });
        } else if (item.type === "signature") {
          let embeddedImage = sigImageMap.get(item.sigId);
          if (!embeddedImage) {
            let dataUrl = signatureCache[item.sigId]?.dataUrl;
            if (!dataUrl) {
              message.loading({
                content: `กำลังดึงรูปภาพลายเซ็น (ID: ${item.sigId})...`,
                key: "sig",
              });
              dataUrl = await callGas("getSignatureAsDataUrl", item.sigId);
            }
            const imageBytes = base64ToUint8Array(dataUrl.split(",")[1]);
            embeddedImage = dataUrl.includes("image/png")
              ? await pdfDoc.embedPng(imageBytes)
              : await pdfDoc.embedJpg(imageBytes);
            sigImageMap.set(item.sigId, embeddedImage);
            message.success({ content: "โหลดภาพลายเซ็นเรียบร้อย", key: "sig" });
          }

          const dims = embeddedImage.scale(item.scale);
          targetPage.drawImage(embeddedImage, {
            x: item.x,
            y: item.y,
            width: dims.width,
            height: dims.height,
          });

          // วาดวันที่ด้านล่างลายเซ็น
          if (item.showDate && item.dateText) {
            if (!customThaiFont) {
              if (!fontBytes) {
                const fontBase64 = await callGas("getThaiFontBase64");
                fontBytes = base64ToUint8Array(fontBase64);
                setFontBytesThai(fontBytes);
              }
              customThaiFont = await pdfDoc.embedFont(fontBytes, {
                subset: true,
              });
            }
            const dateSize = 16;
            const textWidth = customThaiFont.widthOfTextAtSize(
              item.dateText,
              dateSize,
            );
            targetPage.drawText(item.dateText, {
              x: item.x + (dims.width - textWidth) / 2, // จัดกึ่งกลางตามความกว้างลายเซ็น
              y: item.y + 2 - dateSize * 0.8, // ขยับลงใต้ลายเซ็นเล็กน้อย
              size: dateSize,
              font: customThaiFont,
              color: hexToPdfRgb(item.color || "#0A42BA"),
            });
          }
        } else if (item.type === "stamp") {
          const color = hexToPdfRgb(item.color || "#c00000");

          // กรอบสี่เหลี่ยมผืนผ้า
          targetPage.drawRectangle({
            x: item.x,
            y: item.y,
            width: item.width,
            height: item.height,
            borderColor: color,
            borderWidth: 1,
          });

          // ข้อความ 3 บรรทัด จัดกึ่งกลาง (เลขรับ / วันที่ / เวลา)
          const lines = buildStampLines(item);
          const size = item.size || 9;
          const lineHeight = size * TEXT_LINE_HEIGHT_FACTOR;
          const firstBaseline = getStampFirstBaseline(item);

          lines.forEach((line, i) => {
            const textWidth = customThaiFont.widthOfTextAtSize(line, size);
            targetPage.drawText(line, {
              x: item.x + (item.width - textWidth) / 2,
              y: firstBaseline - i * lineHeight,
              size,
              font: customThaiFont,
              color,
            });
          });
        }
      }

      // 3. แปลงเป็น Base64
      const editedPdfBytes = await pdfDoc.save();
      const base64Out = await uint8ArrayToBase64Async(editedPdfBytes);

      // 4. ส่งไปบันทึกทับไฟล์เดิมบน Google Drive
      message.loading({
        content: "กำลังบันทึกทับลงใน Google Drive...",
        key: "save",
      });
      const res = await callGas("overwritePdf", pdfId, base64Out);

      if (res.success) {
        notification.success({
          message: "บันทึกสำเร็จ!",
          description: `บันทึกทับไฟล์เดิมเรียบร้อย โดยใช้ File ID เดิม (${res.fileName})`,
        });

        // คง File ID เดิมไว้ และเรนเดอร์ PDF ใหม่
        form.setFieldsValue({ pdfId: res.fileId || res.newFileId || pdfId });
        setRawPdfBytes(editedPdfBytes);

        const buffer = editedPdfBytes.buffer.slice(
          editedPdfBytes.byteOffset,
          editedPdfBytes.byteOffset + editedPdfBytes.byteLength,
        );
        const newDocJs = await pdfjsLib.getDocument({ data: buffer }).promise;

        setPdfDocJs(newDocJs);
        setAnnotations([]);
        setSelectedId(null);
        if (onSaved) onSaved(res);
      } else {
        throw new Error(res.error);
      }
    } catch (err) {
      notification.error({
        message: "เกิดข้อผิดพลาดในการบันทึก",
        description: err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    // form instance (ส่งให้ <Form form={form}> และ ControlPanel)
    form,

    // state
    loading,
    saving,
    mode,
    setMode,
    annotations,
    selectedId,
    currentPage,
    setCurrentPage,
    totalPages,
    lastClickedCoord,
    signatureCache,
    pdfDocJs,
    fontBytes: fontBytesThai,

    // handlers / callbacks
    onLoadPdf: handleLoadPdf,
    onCanvasClick: handleCanvasClick,
    onSelectAnnotation: handleSelectAnnotation,
    onUpdateAnnotation: handleUpdateAnnotation,
    onDeleteAnnotation: handleDeleteAnnotation,
    onClearAnnotations: handleClearAnnotations,
    onSave: handleSave,
    onFetchSignature: fetchSignatureImage,
  };
};

export default usePdfEditor;

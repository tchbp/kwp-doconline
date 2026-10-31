import { Modal, Button, Space } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import ControlPanel from "./ControlPanel";
import PdfViewerCanvas from "./PdfViewerCanvas";
import usePdfEditor from "../hooks/usePdfEditor";

/**
 * แผงแก้ไข PDF (mount เฉพาะตอน Modal เปิด เพื่อให้ state สะอาดทุกครั้ง)
 *
 * props:
 *   pdfId     string  Google Drive File ID ของ PDF (บังคับ)
 *   sigId     string  Google Drive File ID ของรูปลายเซ็น (ถ้ามี)
 *   mode      'text' | 'signature' | 'stamp' | 'select'  (ค่าเริ่มต้น 'text')
 *   onSaved   (res) => void   เรียกหลังบันทึกสำเร็จ
 *   onClose   () => void
 *   typeJob   string  ประเภทงาน
 *   memo      string  หมายเหตุ
 */
const PdfEditorPanel = ({
  pdfId,
  sigId,
  mode,
  onSaved,
  onClose,
  typeJob,
  memo,
  stamp = false,
}) => {
  const editor = usePdfEditor({
    initialPdfId: pdfId,
    initialSigId: sigId,
    initialMode: mode,
    useConfig: false,
    autoLoad: Boolean(pdfId),
    onSaved,
  });

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4">
          <ControlPanel
            form={editor.form}
            onLoadPdf={editor.onLoadPdf}
            loading={editor.loading}
            mode={editor.mode}
            setMode={editor.setMode}
            annotations={editor.annotations}
            selectedId={editor.selectedId}
            onSelectAnnotation={editor.onSelectAnnotation}
            onUpdateAnnotation={editor.onUpdateAnnotation}
            onDeleteAnnotation={editor.onDeleteAnnotation}
            onClearAnnotations={editor.onClearAnnotations}
            currentPage={editor.currentPage}
            onSave={editor.onSave}
            saving={editor.saving}
            lastClickedCoord={editor.lastClickedCoord}
            signatureCache={editor.signatureCache}
            onFetchSignature={editor.onFetchSignature}
            typeJob={typeJob}
            memo={memo}
            stamp={stamp}
          />
        </div>
        <div className="lg:col-span-8">
          <PdfViewerCanvas
            pdfDocJs={editor.pdfDocJs}
            currentPage={editor.currentPage}
            setCurrentPage={editor.setCurrentPage}
            totalPages={editor.totalPages}
            onCanvasClick={editor.onCanvasClick}
            annotations={editor.annotations}
            selectedId={editor.selectedId}
            onSelectAnnotation={editor.onSelectAnnotation}
            onUpdateAnnotation={editor.onUpdateAnnotation}
            onDeleteAnnotation={editor.onDeleteAnnotation}
            mode={editor.mode}
            loading={editor.loading}
            signatureCache={editor.signatureCache}
            fontBytes={editor.fontBytes}
          />
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Space>
          <Button icon={<CloseOutlined />} onClick={onClose}>
            ปิด
          </Button>
        </Space>
      </div>
    </div>
  );
};

/**
 * Modal ครอบ PdfEditorPanel
 *
 * วิธีใช้ในโปรเจกต์แม่:
 *   const [open, setOpen] = useState(false);
 *   const savedRef = useRef(false);
 *   <Button onClick={() => { savedRef.current = false; setOpen(true); }}>แก้ไข PDF</Button>
 *   <PdfEditorModal
 *     key={pdfId}                 // ← ให้ remount เมื่อเปลี่ยนไฟล์
 *     open={open}
 *     pdfId={pdfId}
 *     sigId={sigId}
 *     onClose={() => { setOpen(false); if (savedRef.current) reload(); }}
 *     onSaved={() => { savedRef.current = true; }}   // ไม่ปิด modal → แก้ต่อได้
 *   />
 *
 * หมายเหตุ: `reload` ต้องประกาศในโปรเจกต์แม่เอง (เช่น โหลดรายการใหม่จาก GAS)
 * ถ้าไม่ต้องการ refresh ก็ไม่ต้องเรียก
 */
const PdfEditorModal = ({
  open,
  pdfId,
  sigId,
  mode,
  onClose,
  onSaved,
  typeJob,
  memo,
  stamp = false,
}) => (
  <Modal
    open={open}
    onCancel={onClose}
    footer={null}
    width="95vw"
    style={{ top: 16, maxWidth: 1400 }}
    styles={{ body: { maxHeight: "85vh", overflow: "auto" } }}
    destroyOnHidden
    title="แก้ไข PDF / วางลายเซ็น"
  >
    {open ? (
      <PdfEditorPanel
        pdfId={pdfId}
        sigId={sigId}
        mode={mode}
        onSaved={onSaved}
        onClose={onClose}
        typeJob={typeJob}
        memo={memo}
        stamp={stamp || false}
      />
    ) : null}
  </Modal>
);

export default PdfEditorModal;

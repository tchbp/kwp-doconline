import React, { useState, useEffect } from "react";
import { Button, Modal, Upload, message, Image } from "antd";
import {
  UploadOutlined,
  InboxOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { callGas } from "@/utils/gasApi";

const { Dragger } = Upload;

const UpSignModal = ({ user, showUpSign, closeUpSign }) => {
  const [isModalOpen, setIsModalOpen] = useState(false); // State สำหรับควบคุมการเปิด/ปิด Modal
  const [previewImage, setPreviewImage] = useState(null); // เก็บ Base64 URL สำหรับแสดงภาพ
  const [fileToUpload, setFileToUpload] = useState(null); // เก็บ Object ไฟล์จริงสำหรับส่ง API
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsModalOpen(showUpSign);
  }, [showUpSign]);

  // เปิด Modal
  const showModal = () => {
    setIsModalOpen(true);
  };

  // ปิด Modal และล้างค่า State
  const handleCancel = () => {
    setIsModalOpen(false);
    setPreviewImage(null);
    setFileToUpload(null);
    closeUpSign(); // เรียกฟังก์ชันปิด Modal จาก props
  };

  // แปลงไฟล์เป็น Base64 เพื่อทำ Image Preview
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  // ทำงานก่อนอัปโหลด: ตรวจสอบไฟล์ + สร้างภาพตัวอย่าง (ไม่ยิง API อัตโนมัติ)
  const handleBeforeUpload = async (file) => {
    // 1. เช็กประเภทไฟล์ (เฉพาะรูปภาพ)
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("กรุณาอัปโหลดเฉพาะไฟล์รูปภาพเท่านั้น!");
      return Upload.LIST_IGNORE;
    }

    // 2. เช็กขนาดไฟล์ (เช่น ไม่เกิน 5MB)
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("ขนาดรูปภาพต้องไม่เกิน 5MB!");
      return Upload.LIST_IGNORE;
    }

    // 3. สร้าง URL รูปภาพเพื่อแสดงบนหน้าต่าง Modal
    const preview = await getBase64(file);
    setPreviewImage(preview);
    setFileToUpload(file);

    // คืนค่า false เพื่อหยุดการอัปโหลดอัตโนมัติของ Ant Design (รอให้ผู้ใช้กดปุ่มยืนยัน)
    return false;
  };

  // ลบรูปที่เลือกไว้เพื่อเลือกใหม่
  const handleRemoveImage = () => {
    setPreviewImage(null);
    setFileToUpload(null);
  };

  // จำลองการส่งไฟล์ไปยัง Backend API เมื่อกดปุ่ม "ยืนยันการอัปโหลด"
  const handleUploadSubmit = async () => {
    if (!fileToUpload) {
      message.warning("กรุณาเลือกรูปภาพก่อนอัปโหลด");
      return;
    }

    setLoading(true);

    const data = {
      user: user,
      filename: fileToUpload.name,
      base64: await getBase64(fileToUpload), // ส่ง Base64 ของไฟล์ไปยัง API
    };
    try {
      const response = await callGas("uploadSignature", data); // เรียกใช้ฟังก์ชัน API ของคุณ
      console.log("Response from API:", response);
      const responseData = JSON.parse(response);
      if (responseData.fileUrl) {
        message.success(`อัปโหลดไฟล์ "${fileToUpload.name}" สำเร็จ!`);
        handleCancel(); // ปิด Modal และรีเซ็ตค่า
      } else {
        message.error("เกิดข้อผิดพลาดในการอัปโหลด");
      }
      //message.success(`อัปโหลดไฟล์ "${fileToUpload.name}" สำเร็จ!`);
    } catch (error) {
      console.error("Error uploading file:", error);
      message.error("เกิดข้อผิดพลาดในการอัปโหลด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* <div style={{ padding: 24 }}> */}
      {/* ปุ่มหลักสำหรับเปิดหน้าต่าง Upload */}
      {/* <Button type="primary" icon={<UploadOutlined />} onClick={showModal}>
        อัปโหลดรูปภาพ
      </Button> */}

      {/* หน้าต่าง Modal */}
      <Modal
        title="อัปโหลดลายเซ็น"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            ยกเลิก
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            disabled={!fileToUpload}
            onClick={handleUploadSubmit}
          >
            ยืนยันการอัปโหลด
          </Button>,
        ]}
      >
        {/* ถ้ายังไม่มีรูป ให้แสดงกล่อง Dragger สำหรับเลือกไฟล์ */}
        {!previewImage ? (
          <Dragger
            name="file"
            multiple={false}
            showUploadList={false}
            beforeUpload={handleBeforeUpload}
            accept="image/*"
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              คลิกหรือลากไฟล์รูปภาพมาวางในพื้นที่นี้
            </p>
            <p className="ant-upload-hint">
              รองรับไฟล์ JPG, PNG, WEBP (ขนาดไม่เกิน 5MB)
            </p>
          </Dragger>
        ) : (
          /* เมื่อเลือกไฟล์แล้ว ให้แสดงภาพตัวอย่างบนหน้าต่าง Modal */
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <div
              style={{
                border: "1px solid #d9d9d9",
                borderRadius: 8,
                padding: 12,
                backgroundColor: "#fafafa",
              }}
            >
              <Image
                src={previewImage}
                alt="Preview"
                style={{
                  maxHeight: 300,
                  objectFit: "contain",
                  borderRadius: 4,
                }}
              />
            </div>

            <div
              style={{
                marginTop: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#595959", fontSize: 13 }}>
                ไฟล์: <strong>{fileToUpload?.name}</strong>
              </span>
              <Button
                danger
                type="text"
                icon={<DeleteOutlined />}
                onClick={handleRemoveImage}
              >
                เปลี่ยนรูปภาพ
              </Button>
            </div>
          </div>
        )}
      </Modal>
      {/* </div> */}
    </>
  );
};

export default UpSignModal;

import { useState } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { Button, message, Upload, Form, Input } from "antd";
import * as serveFns from "@/server/gas";
import { set } from "zod/v4";

const UpFileBook = ({ bookType, id, at, title, onClose, setDataBookList }) => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();

  const propsUpload = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      const maxFileSize = 10 * 1024 * 1024; // 10MB limit
      if (file.size > maxFileSize) {
        message.error(`${file.name} ขนาดไฟล์เกินกว่า 10MB`);
        console.log("File size exceeds the limit of 10MB");
      } else {
        setFileList([...fileList, file]);
      }

      return false;
    },
    accept: ".pdf",
    fileList,
  };
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };
  const handleUpload = () => {
    if (fileList.length === 0) {
      message.error("โปรดเลือกไฟล์ก่อนอัพโหลด");
      return;
    }
    setUploading(true);
    const file = fileList[0];
    const data = {
      id: id,
      at: at,
      title: title,
      filename: file.name,
      bookType: bookType,
    };
    console.log(JSON.stringify(data));
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = (e) => {
      serveFns
        .uploadFileBook(e.target.result, data)
        .then((data) => {
          console.log(JSON.parse(data));
          const { upFileId, upFileUrl } = JSON.parse(data);
          setDataBookList((prevList) =>
            prevList.map((book) =>
              book.id === id
                ? { ...book, fileid: upFileId, fileurl: upFileUrl }
                : book,
            ),
          );
          setUploading(false);
          message.success(`อัพโหลดไฟล์ ${file.name} เรียบร้อยแล้ว`);
          form.resetFields();
          setFileList([]);
          onClose();
        })
        .catch((error) => {
          console.error(error); // พบข้อผิดพลาดในการอัพโหลดไฟล์
          setUploading(false);
          message.error(`เกิดข้อผิดพลาดในการอัพโหลดไฟล์ ${file.name}`);
        });
    };
  };

  return (
    <>
      <div>
        <h2>เลขทะเบียน {id}</h2>
        <h2>ที่ {at}</h2>
        <h2>เรื่อง {title}</h2>
      </div>
      <Form
        form={form}
        {...layout}
        name="control-upload"
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        onFinish={handleUpload}
        autoComplete="off"
      >
        <Form.Item
          label="ไฟล์เอกสาร (ไฟล์ .PDF ขนาดไม่เกิน 10MB)"
          name="file"
          rules={[
            {
              required: true,
              message: "โปรดเลือกไฟล์เอกสาร ขนาดไม่เกิน 10MB",
            },
            () => ({
              validator(_, value) {
                const maxFileSize = 10 * 1024 * 1024; // 10MB limit
                console.log(value);
                console.log(`File size ${value.file.size}`);
                if (value.file.size <= maxFileSize) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("ไฟล์มีขนาดเกิน 10MB โปรดเลือกไฟล์ใหม่"),
                );
              },
            }),
          ]}
        >
          <Upload {...propsUpload}>
            <Button icon={<UploadOutlined />} disabled={fileList.length > 0}>
              เลือกไฟล์ (ไฟล์ .PDF ขนาดไม่เกิน 10MB)
            </Button>
          </Upload>
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Button
            type="primary"
            htmlType="submit"
            disabled={fileList.length === 0}
            loading={uploading}
            style={{ marginTop: 16 }}
          >
            {uploading ? "กำลังส่งไฟล์" : "ส่งไฟล์"}
          </Button>
          <Button
            htmlType="button"
            variant="solid"
            color="danger"
            onClick={onClose}
          >
            ยกเลิก
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default UpFileBook;

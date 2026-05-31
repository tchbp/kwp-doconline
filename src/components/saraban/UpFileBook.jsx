import { useState } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { Button, message, Upload, Form, Tooltip } from "antd";
import * as serveFns from "@/server/gas";

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
        setFileList((prevList) => [...prevList, file]);
      }

      return false;
    },
    //accept: ".pdf",
    maxCount: 3,
    multiple: true,
    listType: "picture",
    fileList,
  };
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };
  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error("โปรดเลือกไฟล์ก่อนอัพโหลด");
      return;
    }
    setUploading(true);
    //const file = fileList[0];
    const data = {
      id: id,
      at: at,
      title: title,
      bookType: bookType,
    };
    console.log(JSON.stringify(data));

    // const reader = new FileReader();
    // reader.readAsDataURL(file);
    // reader.onloadend = (e) => {

    // 1. Convert FileList to a standard Array to use map()
    const filesArray = Array.from(fileList);

    const filePromises = filesArray.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        // Triggers once the file data is completely loaded
        reader.onloadend = (e) => {
          resolve({
            name: file.name,
            size: file.size,
            type: file.type,
            base64: e.target.result, // The read file contents
          });
        };

        // Error handling
        reader.onerror = (error) => reject(error);

        // Read the file as a data URL (ideal for image/video previews)
        reader.readAsDataURL(file);
      });
    });
    const processedFiles = await Promise.all(filePromises);
    //console.log(JSON.stringify(processedFiles));
    //************************** */
    serveFns
      .uploadFileBook(processedFiles, data)
      .then((data) => {
        //console.log(JSON.parse(data));
        const { upFileId, upFileUrl } = JSON.parse(data);
        setDataBookList((prevList) =>
          prevList.map((book) =>
            book.id === id
              ? {
                  ...book,
                  fileid: JSON.stringify(upFileId),
                  fileurl: JSON.stringify(upFileUrl),
                }
              : book,
          ),
        );
        setUploading(false);
        message.success(`อัพโหลดไฟล์  เรียบร้อยแล้ว`);
        form.resetFields();
        setFileList([]);
        onClose();
      })
      .catch((error) => {
        console.error(error); // พบข้อผิดพลาดในการอัพโหลดไฟล์
        setUploading(false);
        message.error(`เกิดข้อผิดพลาดในการอัพโหลดไฟล์ `);
      });
    // *******************
    //};
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
        layout={"vertical"}
        name="control-upload"
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        onFinish={handleUpload}
        autoComplete="off"
      >
        <Form.Item
          label="ไฟล์เอกสาร (ไฟล์ ขนาดไม่เกิน 10MB)"
          name="file"
          rules={[
            {
              required: true,
              message: "โปรดเลือกไฟล์เอกสาร ขนาดไม่เกิน 10MB",
            },
            () => ({
              validator(_, value) {
                const maxFileSize = 10 * 1024 * 1024; // 10MB limit

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
            <Tooltip title="ไฟล์เอกสารใดๆ ขนาดไม่เกิน 10MB">
              <Button icon={<UploadOutlined />} disabled={uploading}>
                เลือกไฟล์ (ไฟล์ ขนาดไม่เกิน 10MB)
              </Button>
            </Tooltip>
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

import { useState } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { Button, message, Upload, Form, Input } from "antd";
import * as serveFns from "@/server/gas";

const UpFile = ({ onHide }) => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();
  const handleUpload = (values) => {
    setUploading(true);
    const file = fileList[0];
    console.log(`Values is ${values}`);
    const data = {
      name: values.name,
      title: values.title,
      filename: file.name,
    };
    console.log(JSON.stringify(data));
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = (e) => {
      serveFns
        .sendFile(e.target.result, data)
        .then((data) => {
          console.log(data);
          setUploading(false);
          message.success(data);
          form.resetFields();
          onHide();
        })
        .catch((error) => {
          console.error(error);
          message.error(error);
        });
    };
  };

  const propsUpload = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
  };
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };
  return (
    <>
      <Form
        {...layout}
        name="control-upload"
        style={{ maxWidth: 600 }}
        onFinish={handleUpload}
      >
        <Form.Item
          name="name"
          label="ชื่อ-สกุล ผู้ UpLoad"
          rules={[{ required: true }]}
        >
          <Input placeholder="ชื่อ-สกุล" />
        </Form.Item>
        <Form.Item
          label="รายละเอียดอย่างย่อ"
          name="title"
          rules={[{ required: true }]}
        >
          <Input placeholder="รายละเอียดอย่างย่อ" />
        </Form.Item>
        <Form.Item name="file">
          <Upload {...propsUpload}>
            <Button icon={<UploadOutlined />} disabled={fileList.length > 0}>
              เลือกไฟล์
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
          <Button htmlType="button" onClick={onHide}>
            ยกเลิก
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default UpFile;

import LoginContext from "@/LoginProvider";
import { useState, useContext, useEffect } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { Button, message, Upload, Form, Input, Select } from "antd";
import * as serveFns from "@/server/gas";
//import * as bdDate from "@/BuddhistDate";

const UpFileJob = ({ onHide, setDataJob, typeJob }) => {
  const contextObj = useContext(LoginContext);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();

  const handleUpload = (values) => {
    setUploading(true);

    const file = fileList[0];
    console.log(`Values is ${values}`);
    const data = {
      user: contextObj.dataLogin.user,
      typeJob: values.typeJob,
      memo: values.memo,
      filename: file.name,
    };
    console.log(JSON.stringify(data));
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = (e) => {
      serveFns
        .sendFileJob(e.target.result, data)
        .then((data) => {
          console.log(JSON.parse(data));
          setDataJob(JSON.parse(data));
          setUploading(false);
          message.success(`เก็บคำสั่ง ${values.title} ไฟล์ ${file.name} แล้ว`);
          form.resetFields();
          setFileList([]);

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
      const maxFileSize = 30 * 1024 * 1024; // 10MB limit
      if (file.size > maxFileSize) {
        message.error(`${file.name} ขนาดไฟล์เกินกว่า 30MB`);
        console.log("File size exceeds the limit of 30MB");
      } else {
        setFileList([...fileList, file]);
      }

      return false;
    },
    accept: ".pdf,doc,.docx,.xls,.xlsx,.ppt,.pptx",
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
        form={form}
        {...layout}
        layout="vertical"
        name="control-upload"
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        onFinish={handleUpload}
        autoComplete="off"
      >
        <Form.Item
          label="ประเภทงาน"
          name="typeJob"
          rules={[{ required: true, message: "โปรดกรอกข้อมูลส่วนนี้ก่อน!" }]}
        >
          <Select
            placeholder="ประเภทงาน"
            options={typeJob.map((job) => ({
              label: job.desc,
              value: job.job,
            }))}
          />
        </Form.Item>
        <Form.Item
          name="memo"
          label="รายละเอียดเพิ่มเติม (รหัสวิชา ชื่อวิชา ฯ)"
          rules={[{ required: true, message: "โปรดกรอกข้อมูลส่วนนี้ก่อน!" }]}
        >
          <Input placeholder="รายละเอียดเพิ่มเติม (รหัสวิชา ชื่อวิชา ฯ)" />
        </Form.Item>

        <Form.Item
          label="ไฟล์เอกสาร"
          name="file"
          rules={[
            {
              required: true,
              message: "โปรดเลือกไฟล์ ขนาดไม่เกิน 30MB",
            },
            () => ({
              validator(_, value) {
                const maxFileSize = 30 * 1024 * 1024; // 10MB limit
                console.log(value);
                console.log(`File size ${value.file.size}`);
                if (value.file.size <= maxFileSize) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("ไฟล์มีขนาดเกิน 30MB โปรดเลือกไฟล์ใหม่"),
                );
              },
            }),
          ]}
        >
          <Upload {...propsUpload}>
            <Button icon={<UploadOutlined />} disabled={fileList.length > 0}>
              เลือกไฟล์ (ไฟล์ ขนาดไม่เกิน 30MB)
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

export default UpFileJob;

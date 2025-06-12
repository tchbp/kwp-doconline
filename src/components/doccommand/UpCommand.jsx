import { useState } from "react";
import { UploadOutlined } from "@ant-design/icons";
import {
  Button,
  message,
  Upload,
  Form,
  Input,
  Select,
  DatePicker,
  ConfigProvider,
} from "antd";
import * as serveFns from "@/server/gas";
import locale from "antd/locale/th_TH";
import dayjs from "dayjs";
import "dayjs/locale/th";
import * as bdDate from "@/BuddhistDate";

dayjs.locale("th");
const UpCommand = ({ onHide, setDataCommand }) => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();
  const [dateValue, setDateValue] = useState(null);
  const onDateChange = (date, dateString) => {
    console.log(date, dateString);
    setDateValue(bdDate.DateEN(date));
  };
  const arrWorkGroup = [
    "กลุ่มบริหารวิชาการ",
    "กลุ่มบริหารงบประมาณ",
    "กลุ่มบริหารงานบุคคล",
    "กลุ่มบริหารทั่วไป",
  ];
  const handleUpload = (values) => {
    setUploading(true);

    const file = fileList[0];
    console.log(`Values is ${values}`);
    const data = {
      nocmd: values.nocmd,
      atdate: dateValue,
      title: values.title,
      workgroup: values.workgroup,
      memo: values.memo,
      filename: file.name,
    };
    console.log(JSON.stringify(data));
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = (e) => {
      serveFns
        .sendFileCommand(e.target.result, data)
        .then((data) => {
          console.log(JSON.parse(data));
          setDataCommand(JSON.parse(data));
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
      const maxFileSize = 10 * 1024 * 1024; // 10MB limit
      if (file.size > maxFileSize) {
        message.error(`${file.name} ขนาดไฟล์เกินกว่า 10MB`);
        console.log("File size exceeds the limit of 250MB");
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

  return (
    <>
      <ConfigProvider locale={locale}>
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
            name="nocmd"
            label="เลขที่คำสั่ง"
            rules={[{ required: true, message: "โปรดกรอกข้อมูลส่วนนี้ก่อน!" }]}
          >
            <Input placeholder="เลขที่คำสั่ง" />
          </Form.Item>
          <Form.Item
            label="ลงวันที่"
            name="atdate"
            rules={[{ required: true, message: "โปรดเลือกวันที่!" }]}
          >
            <DatePicker
              onChange={onDateChange}
              format={"D MMMM YYYY"}
              placeholder="ลงวันที่"
            />
          </Form.Item>

          <Form.Item
            label="คำสั่งเรื่อง"
            name="title"
            rules={[{ required: true, message: "โปรดกรอกข้อมูลส่วนนี้ก่อน!" }]}
          >
            <Input placeholder="คำสั่งเรื่อง" />
          </Form.Item>
          <Form.Item
            label="กลุ่มงานต้นเรื่อง"
            name="workgroup"
            rules={[{ required: true, message: "โปรดกรอกข้อมูลส่วนนี้ก่อน!" }]}
          >
            <Select
              placeholder="กลุ่มงานต้นเรื่อง"
              options={arrWorkGroup.map((wg) => ({ label: wg, value: wg }))}
            />
          </Form.Item>
          <Form.Item label="บันทึกเพิ่มเติม" name="memo">
            <Input placeholder="บันทึกเพิ่มเติม" />
          </Form.Item>

          <Form.Item
            label="ไฟล์คำสั่ง"
            name="file"
            rules={[
              {
                required: true,
                message: "โปรดเลือกไฟล์คำสั่ง ขนาดไม่เกิน 10MB",
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
                    new Error("ไฟล์มีขนาดเกิน 10MB โปรดเลือกไฟล์ใหม่")
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
            <Button htmlType="button" onClick={onHide}>
              ยกเลิก
            </Button>
          </Form.Item>
        </Form>
      </ConfigProvider>
    </>
  );
};

export default UpCommand;

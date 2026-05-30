import { useState, useEffect, use } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  message,
  ConfigProvider,
} from "antd";
import { FileAddOutlined } from "@ant-design/icons";
import locale from "antd/locale/th_TH";
import dayjs from "dayjs";
import "dayjs/locale/th";
import * as bdDate from "@/BuddhistDate";
import * as serveFns from "@/server/gas";

dayjs.locale("th");

const FormAddBook = ({
  cmdType,
  bookType,
  user,
  nextid,
  data2Edit,
  onClose,
  setDataBookList,
}) => {
  const [uploading, setUploading] = useState(false);
  const [dateValue, setDateValue] = useState(null);
  //   const onDateChange = (date, dateString) => {
  //     console.log(date, dateString);
  //     setDateValue(bdDate.DateEN(date));
  //   };
  const [arrWorkGroup, setArrWorkGroup] = useState([
    "กลุ่มบริหารวิชาการ",
    "กลุ่มบริหารงบประมาณ",
    "กลุ่มบริหารงานบุคคล",
    "กลุ่มบริหารทั่วไป",
  ]);

  const [form] = Form.useForm();
  useEffect(() => {
    //form.setFieldsValue({ id: nextid });
    console.log(`data2Edit is ${JSON.stringify(data2Edit)}`);
    if (cmdType === "edit") {
      //setDateValue(data2Edit.atdate);
      form.setFieldsValue({
        id: data2Edit.id,
        at: data2Edit.at,
        atdate: dayjs(data2Edit.atdate, "MM-DD-YY"),
        from: data2Edit.from,
        to: data2Edit.to,
        title: data2Edit.title,
        action: data2Edit.action,
        note: data2Edit.note,
      });
    } else {
      form.setFieldsValue({ id: nextid });
    }
    serveFns
      .getTeacher()
      .then((data) => {
        const teachers = JSON.parse(data);
        const teacherNames = teachers.map((t) => t.name);
        //console.log(`teacherNames is ${teacherNames}`);
        setArrWorkGroup((prev) => [...prev, ...teacherNames]);
        //console.log(` arrWorkGroup is ${arrWorkGroup}`);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const newBook = {
        id: values.id,
        at: values.at,
        atdate: bdDate.DateEN(values.atdate),
        from: values.from,
        to: values.to,
        title: values.title,
        action: values.action,
        note: values.note,
        fileid: data2Edit?.fileid || "",
        fileurl: data2Edit?.fileurl || "",
        user: user,
      };
      console.log(JSON.stringify(newBook));
      setUploading(true);
      serveFns
        .addNoBook(user, bookType, cmdType, newBook)
        .then((result) => {
          setDataBookList(JSON.parse(result).reverse());
          setUploading(false);
          message.success("เพิ่มหนังสือเรียบร้อยแล้ว");
          onClose();
        })
        .catch((error) => {
          console.log(error);
          setUploading(false);
          message.error("เกิดข้อผิดพลาดในการเพิ่มหนังสือ");
        });
    });
  };
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };
  return (
    <ConfigProvider locale={locale}>
      <Form
        form={form}
        //{...layout}
        layout={"vertical"}
        name="basic"
        initialValues={{ remember: true }}
        onFinish={handleSubmit}
      >
        <Form.Item
          label="เลขทะเบียน"
          name="id"
          rules={[{ required: true, message: "กรุณากรอกเลขทะเบียน!" }]}
        >
          <InputNumber min={1} readOnly={cmdType === "edit"} />
        </Form.Item>
        <Form.Item
          label="ที่"
          name="at"
          rules={[{ required: true, message: "กรุณากรอกที่!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="ลงวันที่"
          name="atdate"
          rules={[{ required: true, message: "โปรดเลือกวันที่!" }]}
        >
          <DatePicker
            // onChange={onDateChange}
            format={"D MMMM YYYY"}
            placeholder="ลงวันที่"
          />
        </Form.Item>
        {bookType < 3 && (
          <Form.Item
            label="จาก"
            name="from"
            rules={[{ required: true, message: "กรุณากรอกจาก!" }]}
          >
            <Input />
          </Form.Item>
        )}
        {bookType < 3 && (
          <Form.Item
            label="ถึง"
            name="to"
            rules={[{ required: true, message: "กรุณากรอกถึง!" }]}
          >
            <Input />
          </Form.Item>
        )}
        <Form.Item
          label="หัวเรื่อง"
          name="title"
          rules={[{ required: true, message: "กรุณากรอกหัวเรื่อง!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="การปฏิบัติ"
          name="action"
          rules={[{ required: false, message: "โปรดกรอกข้อมูลส่วนนี้ก่อน!" }]}
        >
          <Select
            placeholder="การปฏิบัติ"
            options={arrWorkGroup.map((wg) => ({ label: wg, value: wg }))}
            open={bookType === 0 && user !== "banpot" ? false : undefined}
          />
        </Form.Item>
        <Form.Item label="หมายเหตุ" name="note">
          <Input placeholder="หมายเหตุ" />
        </Form.Item>

        <Form.Item {...tailLayout}>
          <Button
            type="primary"
            htmlType="submit"
            icon={<FileAddOutlined />}
            loading={uploading}
            style={{ marginTop: 16 }}
          >
            บันทึก
          </Button>
          <Button htmlType="button" type="primary" danger onClick={onClose}>
            ยกเลิก
          </Button>
        </Form.Item>
      </Form>
    </ConfigProvider>
  );
};
export default FormAddBook;

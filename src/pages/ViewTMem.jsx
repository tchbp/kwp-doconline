import { useState, useEffect, useContext } from "react";
import {
  DatePicker,
  Card,
  Button,
  Input,
  Select,
  Space,
  Table,
  Radio,
  Modal,
  Form,
  Flex,
  message,
  Typography,
  ConfigProvider,
} from "antd";
import * as serveFns from "@/server/gas";
import locale from "antd/locale/th_TH";
import dayjs from "dayjs";
import "dayjs/locale/th";
import * as bdDate from "@/BuddhistDate";
import LoginContext from "@/LoginProvider";
import Spin2Wait from "@/components/Spin2Wait";

dayjs.locale("th");

const ViewTMem = () => {
  const [studentData, setStudentData] = useState([]);
  const [dateValue, setDateValue] = useState(null);
  const [studentClass, setStudentClass] = useState(null);
  const [showTab, setShowTab] = useState(false);
  const [onSpin, setOnSpin] = useState({
    spin: false,
    message: "",
  });

  const onDateChange = (date, dateString) => {
    setDateValue(bdDate.DateEN(date));
    setShowTab(false);
  };
  const onClassChange = (value) => {
    setStudentClass(value);
  };

  const onFinish = (vaules) => {
    console.log("Success:", vaules);
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  useEffect(() => {
    //console.log(contexObj.dataLogin);
    //console.log(`date:${dateValue} class:${studentClass} pr:${pr}`);
    if (dateValue && studentClass) {
      console.log(`date: ${dateValue}  class: ${studentClass}`);
      setShowTab(false);
      setOnSpin({ spin: true, message: "กำลังดึงข้อมูล โปรดรอซักครู่" });
      const objData = {
        user: "",
        tdate: dateValue,
        tclass: studentClass,
      };
      serveFns
        .getTeachMem(objData)
        .then((data) => {
          console.log(data);
          setStudentData(JSON.parse(data));
          setShowTab(true);
          setOnSpin({ spin: false, message: "กำลังดึงข้อมูล โปรดรอซักครู่" });
        })
        .catch((error) => {
          console.error(error);
          setOnSpin({ spin: false, message: "กำลังดึงข้อมูล โปรดรอซักครู่" });
        });
    }
  }, [dateValue, studentClass]);

  const stdClass = ["ม.1", "ม.2", "ม.3", "ม.4", "ม.5", "ม.6"];
  const [form] = Form.useForm();
  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 14 },
    },
  };
  const columns = [
    {
      title: "ชั่วโมงที่",
      dataIndex: "pr",
      key: "pr",
      rowScope: "row",
    },
    {
      title: "ผู้สอน",
      dataIndex: "tname",
      key: "tname",
    },
    {
      title: "วิชา",
      dataIndex: "subj",
      key: "subj",
    },
    {
      title: "กิจกรรม",
      dataIndex: "atc",
      key: "atc",
    },
    {
      title: "บันทึก",
      dataIndex: "memo",
      key: "memo",
    },
    {
      title: "บันทึกเข้าเรียน",
      dataIndex: "stdabs",
      key: "stdabs",
    },
  ];

  return (
    <>
      <Spin2Wait onSpin={onSpin.spin} message={onSpin.message} />
      <Card
        hoverable
        title="ดูบันทึกเข้าสอน"
        styles={{
          body: { padding: 25, overflow: "hidden" },
          header: { padding: 25, backgroundColor: "#69b1ff" },
        }}
      >
        <Space orientation="vertical">
          <ConfigProvider locale={locale}>
            <Space orientation="vertical" size="middle">
              <Form
                form={form}
                layout="inline"
                style={{ maxWidth: "none" }}
                initialValues={{ remember: true }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
              >
                <Form.Item
                  label="วันที่สอน"
                  name="tdate"
                  rules={[{ required: true, message: "โปรดเลือกวันที่!" }]}
                >
                  <DatePicker
                    onChange={onDateChange}
                    format={"D MMMM YYYY"}
                    placeholder="วันที่สอน"
                  />
                </Form.Item>
                <Form.Item
                  label="ชั้นเรียน"
                  name="tclass"
                  rules={[{ required: true, message: "โปรดเลือกชั้นเรียน!" }]}
                >
                  <Select
                    placeholder="เลือกชั้นเรียน"
                    style={{ width: 120 }}
                    options={stdClass.map((std) => ({
                      label: std,
                      value: std,
                    }))}
                    onChange={onClassChange}
                  />
                </Form.Item>
              </Form>
            </Space>
          </ConfigProvider>
          <Space>
            {showTab && (
              <Table
                columns={columns}
                dataSource={studentData}
                pagination={false}
                bordered
              />
            )}
          </Space>
        </Space>
      </Card>
    </>
  );
};

export default ViewTMem;

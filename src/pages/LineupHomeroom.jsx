import { useState, useEffect, useContext } from "react";
import * as serveFns from "@/server/gas";
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
} from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { ConfigProvider } from "antd";
import locale from "antd/locale/th_TH";
import dayjs from "dayjs";
import "dayjs/locale/th";
import * as bdDate from "@/BuddhistDate";
import LoginContext from "@/LoginProvider";
import Spin2Wait from "@/components/Spin2Wait";

dayjs.locale("th");

const LineupHomeroom = () => {
  const contexObj = useContext(LoginContext);

  const [dateValue, setDateValue] = useState(null);
  const [upLoading, setUpLoading] = useState(false);
  const [studentData, setStudentData] = useState([]);
  const [studentClass, setStudentClass] = useState(null);
  const [stdStatus, setStdStatus] = useState([]);
  const [showTab, setShowTab] = useState(false);
  const [pr, setPr] = useState("");
  const [onSpin, setOnSpin] = useState({
    spin: false,
    message: "",
  });

  const onDateChange = (date, dateString) => {
    setDateValue(bdDate.DateEN(date));
  };
  const onClassChange = (value) => {
    setStudentClass(value);
    setPr("");
    form.setFieldsValue({ tpr: "" });
  };
  const onPrChange = (value) => {
    setPr(value);
  };

  const [modal, contextHolder] = Modal.useModal();
  const teachAlready = async (data) => {
    const confirmed = await modal.confirm({
      title: "แจ้งเตือน",
      icon: <ExclamationCircleOutlined />,
      content: "คุณได้บันทึกการสอนในชั่วโมงสอนนี้แล้ว ต้องการบันทึกใหม่หรือไม่",
    });
    console.log(confirmed);
    if (confirmed) {
      setStudentData(JSON.parse(data));
      setShowTab(true);
    }
  };
  const teachByAnother = async (tname) => {
    await modal.confirm({
      title: "แจ้งเตือน",
      icon: <ExclamationCircleOutlined />,
      content: `มีครู ${tname} ได้บันทึกการสอนแล้ว โปรดตรวจสอบใหม่`,
    });
  };
  useEffect(() => {
    setStudentClass(contexObj.dataLogin.advice);
    setPr("hr");
    form.setFieldsValue({ tclass: contexObj.dataLogin.advice });
  }, []);

  useEffect(() => {
    //console.log(contexObj.dataLogin);
    console.log(`date:${dateValue} class:${studentClass} pr:${pr}`);
    if (dateValue && studentClass && pr) {
      setShowTab(false);
      setStdStatus([]);
      setOnSpin({ spin: true, message: "กำลังดึงข้อมูล โปรดรอซักครู่" });
      const objData = {
        user: contexObj.dataLogin.user,
        tdate: dateValue,
        tclass: studentClass,
        tpr: pr,
      };
      serveFns
        .std4Homeroom(objData)
        .then((data) => {
          if (data.act === "") {
            setStudentData(JSON.parse(data.studentData));
            setShowTab(true);
            setOnSpin({ spin: false, message: "กำลังดึงข้อมูล โปรดรอซักครู่" });
          } else if (data.act === "บันทึกแล้ว") {
            setOnSpin({
              spin: false,
              message: "กำลังดึงข้อมูล โปรดรอซักครู่",
            });
            teachAlready(data.studentData);
          } else if (data.act === "มีครูอื่นบันทึก") {
            setOnSpin({
              spin: false,
              message: "กำลังดึงข้อมูล โปรดรอซักครู่",
            });
            teachByAnother(data.name);
          }
        })
        .catch((error) => {
          console.error(error);
          setOnSpin({ spin: false, message: "กำลังดึงข้อมูล โปรดรอซักครู่" });
        });
    }
  }, [dateValue]);

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
  const [form] = Form.useForm();
  const stdClass = ["ม.1", "ม.2", "ม.3", "ม.4", "ม.5", "ม.6"];
  const statusType = ["มา", "ลา", "ขาด"];
  const columns = [
    {
      title: "เลขประจำตัว",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "ชื่อ-สกุล",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "สถานะ",
      key: "status",
      render: (_, record) => (
        <>
          <Radio.Group
            options={statusType}
            optionType="button"
            buttonStyle="solid"
            onChange={({ target: { value } }) => {
              console.log(`value=${value} id=${record.id}`);
              setStatus(record.id, value);
            }}
          />
        </>
      ),
    },
  ];
  const setStatus = (id, status) => {
    const stdSelect = studentData.find((std) => {
      return std.id === id;
    });
    stdSelect.status = status;
    setStdStatus([
      ...stdStatus.filter((std) => {
        return std.id !== id;
      }),
      stdSelect,
    ]);
  };
  const onFinish = (values) => {
    if (showTab) {
      values.tdate = dateValue;
      values.tpr = pr;
      values.user = contexObj.dataLogin.user;
      values.name = contexObj.dataLogin.name;
      values.stdStatus = [
        ...stdStatus.filter((std) => {
          return std.status !== "มา";
        }),
      ];
      values.stdKad = [
        ...stdStatus.filter((std) => {
          return std.status === "ขาด";
        }),
      ].map((std) => {
        return std.id;
      });
      values.stdLa = [
        ...stdStatus.filter((std) => {
          return std.status === "ลา";
        }),
      ].map((std) => {
        return std.id;
      });
      console.log("Values:", values);
      setOnSpin({ spin: true, message: "กำลังบันทึกข้อมูล โปรดรอซักครู่" });
      setUpLoading(true);
      serveFns
        .putHomeroom(values)
        .then((data) => {
          setStudentData([]);
          setShowTab(false);
          setOnSpin({ spin: false, message: "กำลังดึงข้อมูล โปรดรอซักครู่" });
          message.success(data);
          setStdStatus([]);
          form.resetFields();
          form.setFieldsValue({ tclass: contexObj.dataLogin.advice });
          setDateValue("");
          setUpLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setOnSpin({ spin: false, message: "กำลังดึงข้อมูล โปรดรอซักครู่" });
        });
    } else {
      message.warning(
        "ยังไม่สามารถบันทึกได้ อาจมีข้อผิดพลาดบางประการโปรดตรวจสออบ"
      );
    }
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <>
      <Spin2Wait onSpin={onSpin.spin} message={onSpin.message} />
      <Space direction="vertical" size="middle" style={{ display: "flex" }}>
        <Card
          title={`บันทึกเข้าแถว/โฮมรูม ชั้น ${contexObj.dataLogin.advice}`}
          hoverable
          styles={{
            body: { padding: 25, overflow: "hidden" },
            header: { padding: 25, backgroundColor: "#ffec3d" },
          }}
        >
          <ConfigProvider locale={locale}>
            <Form
              form={form}
              style={{ maxWidth: 600 }}
              initialValues={{ remember: true }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
            >
              <Form.Item
                label="วันที่"
                name="tdate"
                rules={[{ required: true, message: "โปรดเลือกวันที่!" }]}
              >
                <DatePicker
                  onChange={onDateChange}
                  format={"D MMMM YYYY"}
                  placeholder="วันที่"
                />
              </Form.Item>
              <Form.Item
                label="ชั้นเรียน"
                name="tclass"
                rules={[
                  { required: true, message: "ยังไม่มีข้อมูลครูประจำชั้น!" },
                ]}
              >
                <Select
                  placeholder="เลือกชั้นเรียน"
                  style={{ width: 120 }}
                  options={stdClass.map((std) => ({ label: std, value: std }))}
                  onChange={onClassChange}
                  disabled
                />
              </Form.Item>

              <Form.Item label="กิจกรรม" name="act">
                <Input.TextArea rows={3} placeholder="กิจกรรม" />
              </Form.Item>
              <Form.Item label="บันทึกเพิ่มเติม" name="memo">
                <Input.TextArea rows={3} placeholder="บันทึกเพิ่มเติม" />
              </Form.Item>
              {showTab && (
                <Card
                  title="บันทึกนักเรียนร่วมกิจกรรม (เช็กเฉพาะ ขาด ลา)"
                  hoverable
                  styles={{
                    body: { padding: 0, overflow: "hidden" },
                    header: { backgroundColor: "MediumSeaGreen" },
                  }}
                >
                  <Table
                    columns={columns}
                    dataSource={studentData}
                    pagination={false}
                  />
                  {/*<p>
                    {stdStatus.map((std, index) => (
                      <div key={index}>
                        {std.id} : {std.name} : {std.status}
                      </div>
                    ))}
                  </p>*/}
                </Card>
              )}
              <Flex
                align="center"
                justify="center"
                style={{ width: "100%", height: 120 }}
              >
                <Form.Item label={null}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={upLoading}
                    disabled={upLoading && showTab}
                  >
                    {upLoading ? "กำลังส่งบันทึก" : "บันทึก"}
                  </Button>
                </Form.Item>
              </Flex>
            </Form>
          </ConfigProvider>
        </Card>
        {contextHolder}
      </Space>
    </>
  );
};

export default LineupHomeroom;

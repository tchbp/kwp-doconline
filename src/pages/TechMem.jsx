import { useState, useEffect, useContext } from "react";
import * as serveFns from "@/server/gas";
import {
  DatePicker,
  Card,
  Button,
  Input,
  Select,
  Checkbox,
  Space,
  Table,
  Radio,
  Modal,
  Form,
  Flex,
  message,
  Spin,
} from "antd";
import {
  FileOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { ConfigProvider } from "antd";
import locale from "antd/locale/th_TH";
import dayjs from "dayjs";
import "dayjs/locale/th";
import * as bdDate from "@/BuddhistDate";
import LoginContext from "@/LoginProvider";
import Spin2Wait from "@/components/Spin2Wait";
import { set } from "zod";

dayjs.locale("th");
const TechMem = () => {
  const contexObj = useContext(LoginContext);

  const [dateValue, setDateValue] = useState(null);
  const [upLoading, setUpLoading] = useState(false);
  const [studentData, setStudentData] = useState([]);
  const [studentClass, setStudentClass] = useState(null);
  const [subjOptions, setSubjOptions] = useState([]);
  const [subjLoaded, setSubjLoaded] = useState(false);
  const [subjSelected, setSubjSelected] = useState(undefined);
  const [t4checked, setT4checked] = useState(false);
  const [t4Options, setT4Options] = useState([]);
  const [t4Usr, setT4Usr] = useState("");
  const [stdStatus, setStdStatus] = useState([]);
  const [showTab, setShowTab] = useState(false);
  const [pr, setPr] = useState("");
  const [onSpin, setOnSpin] = useState({
    spin: false,
    message: "",
  });

  const onDateChange = (date, dateString) => {
    setDateValue(bdDate.DateEN(date));
    setStudentClass("");
    setPr("");
    form.setFieldsValue({ tclass: "", tpr: "" });
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
  const getSubject = ({ user, all }) => {
    setSubjLoaded(false);
    serveFns
      .getSubj4Teach({ user, all })
      .then((data) => {
        // parse once and normalize to { label, value }
        const subj4usr = typeof data === "string" ? JSON.parse(data) : data;
        //setSubj4Teach(subj4usr);
        // const subj4usr = parsed.filter(
        //   (subj) => subj.user === contexObj.dataLogin.user
        // );
        let normalized = [];
        if (!all) {
          normalized = subj4usr.map((s) => ({
            label: (s.namesubj ?? s.name ?? "").toString(),
            value: (s.subj ?? s.id ?? "").toString(),
          }));
        } else {
          setSubjLoaded(false);
          serveFns
            .getTeacher()
            .then((dataT) => {
              const teachers =
                typeof dataT === "string" ? JSON.parse(dataT) : dataT;
              const teacherMap = teachers.map((t) => ({
                label: t.name,
                title: t.name,
                options: subj4usr
                  .filter((s) => s.user === t.user)
                  .map((s) => ({
                    label: (s.namesubj ?? s.name ?? "").toString(),
                    value: (s.subj ?? s.id ?? "").toString(),
                  })),
              }));
              normalized = teacherMap;
              console.log("subj normalized:", normalized);
              setSubjOptions(normalized);
              setSubjLoaded(true); // finish loading
            })
            .catch((error) => {
              console.error("Error fetching teachers:", error);
            });
        }
        console.log("subj normalized:", normalized);
        setSubjOptions(normalized);
        setSubjLoaded(true); // finish loading
      })
      .catch((error) => {
        console.error(error);
        setSubjLoaded(false);
      });
  };
  useEffect(() => {
    const usr = t4checked ? t4Usr : contexObj.dataLogin.user;
    getSubject({ user: usr, all: false });
  }, [t4checked, t4Usr]);
  useEffect(() => {
    //getSubject({ user: contexObj.dataLogin.user, all: t4checked });
    serveFns
      .getTeacher()
      .then((dataT) => {
        const teachers = typeof dataT === "string" ? JSON.parse(dataT) : dataT;
        const tOptions = teachers
          .filter((t) => t.user !== contexObj.dataLogin.user)
          .map((t) => ({
            label: t.name,
            value: t.user,
          }));
        setT4Options(tOptions);
      })
      .catch((error) => {
        console.error("Error fetching teachers:", error);
      });
  }, []);

  useEffect(() => {
    //console.log(contexObj.dataLogin);
    //console.log(`date:${dateValue} class:${studentClass} pr:${pr}`);

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
        .std4Teach(objData)
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
  }, [dateValue, studentClass, pr]);

  const onT4Change = (e) => {
    setT4checked(e.target.checked);
    setSubjSelected(undefined);
    setSubjLoaded(false);
    if (!e.target.checked) {
      setT4Usr("");
      //getSubject({ user: contexObj.dataLogin.user, all: false });
    }
    form.setFieldsValue({ subject: undefined, name_t4: undefined });
  };
  const handleT4Select = (value) => {
    console.log(`Selected teacher for substitution: ${value}`);
    setSubjSelected(undefined);
    setT4Usr(value);
    //getSubject({ user: value, all: false });
    form.setFieldsValue({ subject: undefined });
  };
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
      values.t4usr = t4Usr;
      console.log("Values:", values);
      setOnSpin({ spin: true, message: "กำลังบันทึกข้อมูล โปรดรอซักครู่" });
      setUpLoading(true);
      serveFns
        .putTeachMem(values)
        .then((data) => {
          setStudentData([]);
          setShowTab(false);
          setOnSpin({ spin: false, message: "กำลังดึงข้อมูล โปรดรอซักครู่" });
          message.success(data);
          setStdStatus([]);
          form.resetFields();
          setDateValue("");
          setStudentClass("");
          setPr("");
          setUpLoading(false);
          if (t4checked) {
            setT4Usr("");
            //getSubject({ user: contexObj.dataLogin.user, all: false });
          }
          setT4checked(false);
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
      <Space orientation="vertical" size="middle" style={{ display: "flex" }}>
        <Card
          title={`บันทึกเข้าสอน ครู ${contexObj.dataLogin.name}`}
          hoverable
          styles={{
            body: { padding: 25, overflow: "hidden" },
            header: { padding: 25, backgroundColor: "DodgerBlue" },
          }}
        >
          <ConfigProvider locale={locale}>
            <Form
              form={form}
              style={{ maxWidth: 600 }}
              initialValues={{ remember: true }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
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
                  options={stdClass.map((std) => ({ label: std, value: std }))}
                  onChange={onClassChange}
                />
              </Form.Item>
              <Form.Item
                label="ชั่วโมงเรียนที่"
                name="tpr"
                rules={[{ required: true, message: "โปรดเลือกชั่วโมงเรียน!" }]}
              >
                <Select
                  placeholder="เลือกชั่วโมงเรียน"
                  style={{ width: 120 }}
                  options={[...Array(9).keys()].map((i) => ({
                    label: i + 1,
                    value: i + 1,
                  }))}
                  onChange={onPrChange}
                />
              </Form.Item>
              <Form.Item>
                <Form.Item
                  name="t4"
                  style={{ display: "inline-block", marginRight: 8 }}
                >
                  <Checkbox checked={t4checked} onChange={onT4Change}>
                    สอนแทน
                  </Checkbox>
                </Form.Item>
                <Form.Item name="name_t4" style={{ display: "inline-block" }}>
                  <Select
                    style={{ marginLeft: 10, width: 200 }}
                    placeholder="เลือกครูที่สอนแทน"
                    disabled={!t4checked}
                    showSearch={{
                      optionFilterProp: "label",
                      filterSort: (optionA, optionB) =>
                        (optionA?.label ?? "")
                          .toLowerCase()
                          .localeCompare((optionB?.label ?? "").toLowerCase()),
                    }}
                    onChange={handleT4Select}
                    options={t4Options}
                  />
                </Form.Item>
              </Form.Item>
              <Form.Item
                label="วิชาสอน"
                name="subject"
                rules={[{ required: true, message: "โปรดบันทึกวิชาสอน!" }]}
              >
                <Select
                  key={t4checked ? "allsubj" : "usersubj"}
                  value={subjSelected}
                  placeholder={subjLoaded ? "เลือกวิชาสอน" : "กำลังโหลด..."}
                  style={{ width: 300 }}
                  listItemHeight={40}
                  listHeight={300}
                  showSearch={{
                    optionFilterProp: "label",
                    filterSort: (optionA, optionB) =>
                      (optionA?.label ?? "")
                        .toLowerCase()
                        .localeCompare((optionB?.label ?? "").toLowerCase()),
                  }}
                  options={subjOptions} // ใช้ normalized options ตรงๆ
                  disabled={!subjLoaded}
                  notFoundContent={subjLoaded ? null : <Spin size="small" />}
                  virtual={false}
                />
              </Form.Item>
              <Form.Item label="กิจกรรมการสอน" name="act">
                <Input.TextArea rows={3} placeholder="กิจกรรมการสอน" />
              </Form.Item>
              <Form.Item label="บันทึกเพิ่มเติม" name="memo">
                <Input.TextArea rows={3} placeholder="บันทึกเพิ่มเติม" />
              </Form.Item>
              {showTab && (
                <Card
                  title="บันทึกเวลาเรียนนักเรียน (เช็กเฉพาะ ขาด ลา)"
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

export default TechMem;

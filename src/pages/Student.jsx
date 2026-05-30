import { useState, useEffect, useContext } from "react";

//import TabStudent from "@/components/TabStudent";
import * as serveFns from "@/server/gas";
import UpFile from "@/components/UpFile";
import md5 from "md5";

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
} from "antd";
import { ConfigProvider } from "antd";
import locale from "antd/locale/th_TH";
import dayjs from "dayjs";
import "dayjs/locale/th";
import * as bdDate from "@/BuddhistDate";
import LoginForm from "@/components/doccommand/LoginForm";
import LoginContext from "@/LoginProvider";

dayjs.locale("th");
const Student = () => {
  const [textInput, setTextInput] = useState("");
  const [textMd5, setTextMd5] = useState("");
  const [studentData, setStudentData] = useState([]);
  const [studentClass, setStudentClass] = useState(null);
  const [stdStatus, setStdStatus] = useState([]);
  const [showTab, setShowTab] = useState(false);
  const contexObj = useContext(LoginContext);
  const [modalShow, setModalShow] = useState(false);
  const [loginShow, setLoginShow] = useState(false);
  const [login, setLogin] = useState(false);
  const [dateValue, setDateValue] = useState(null);
  const [curDate, setCurDate] = useState(bdDate.DateLongTH(new Date()));
  const onChange = (date, dateString) => {
    console.log(date, dateString);
    setDateValue(date.toString());
    setShowTab(false);
    setStdStatus([]);
    setStudentClass(null);
  };

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
  useEffect(() => {
    setShowTab(studentData.length > 0);
  }, [studentData]);
  //เมื่อเลือกชั้น===============================>
  const handleChange = (value) => {
    setStudentClass(value);
    setShowTab(false);
    console.log(value);
    serveFns
      .getStudentData(value)
      .then((data) => {
        setStudentData(JSON.parse(data));
        console.log(studentData);
      })
      .catch((error) => console.error(error));
  };

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
  const showModalUpFile = () => {
    setModalShow(true);
  };
  const hideModalUpFile = () => {
    setModalShow(false);
  };

  return (
    <>
      <Modal
        title="ลงชื่อเข้าใช้"
        open={loginShow}
        onCancel={() => setLoginShow(false)}
        footer={null}
        closable={false}
        keyboard={false}
      >
        <LoginForm
          onHide={() => setLoginShow(false)}
          isLogin={(e) => setLogin(e)}
        />
      </Modal>
      <Space orientation="vertical" size="middle" style={{ display: "flex" }}>
        <Space orientation="vertical" size="middle">
          <Space.Compact>
            <Input
              onChange={(e) => {
                setTextInput(e.target.value);
              }}
              value={textInput}
            />
            <Button onClick={() => setTextMd5(md5(textInput))}>to MD5</Button>
          </Space.Compact>
          <p>Text : {textInput}</p>
          <p>MD5 : {textMd5}</p>
          <p>Current Date {curDate}</p>
          <Space>
            <Button variant="success" onClick={() => setLoginShow(true)}>
              ลงชื่อเข้าใช้
            </Button>
            {login ? "ผ่าน" : "ไม่ผ่าน"}
            {contexObj.dataLogin.name}
          </Space>
        </Space>
        <Card type="inner" title="รายชื่อนักเรียน">
          <Modal
            title="Up Load ไฟล์"
            open={modalShow}
            onClose={hideModalUpFile}
            footer={null}
          >
            <UpFile onHide={hideModalUpFile} />
          </Modal>
          <Button variant="success" onClick={showModalUpFile}>
            ส่งไฟล์
          </Button>

          <ConfigProvider locale={locale}>
            <DatePicker onChange={onChange} format={"D MMMM YYYY"} />
          </ConfigProvider>

          <Select
            onChange={handleChange}
            placeholder="เลือกชั้นเรียน"
            style={{ width: 120 }}
            value={studentClass}
            options={stdClass.map((std) => ({ label: std, value: std }))}
          />

          {showTab && <Table columns={columns} dataSource={studentData} />}
          <div>
            สถานะมาเรียน วันที่ {bdDate.DateLongTH(dateValue)}
            {stdStatus.map((std, index) => (
              <div key={index}>
                {std.id} : {std.name} : {std.status}
              </div>
            ))}
          </div>

          <Button
            onClick={() => {
              setShowTab(false);
              setStdStatus([]);
              setStudentClass(null);
            }}
            variant="primary"
          >
            ส่ง
          </Button>
        </Card>
      </Space>
    </>
  );
};

export default Student;

import { useState, useEffect, useContext } from "react";
import { Table, Space, Tooltip, Button, message, Modal, Card } from "antd";
import { DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import * as serveFns from "@/server/gas";
import locale from "antd/locale/th_TH";
import dayjs from "dayjs";
import "dayjs/locale/th";
import * as bdDate from "@/BuddhistDate";
import LoginContext from "@/LoginProvider";
import Spin2Wait from "@/components/Spin2Wait";

dayjs.locale("th");

const ViewMyTeach = () => {
  const contextObj = useContext(LoginContext);
  const [myData, setMyData] = useState([]);
  const [showTab, setShowTab] = useState(false);
  const [onSpin, setOnSpin] = useState({
    spin: false,
    message: "",
  });

  useEffect(() => {
    setOnSpin({ spin: true, message: "กำลังดึงข้อมูล โปรดรอซักครู่" });
    const objData = {
      user: contextObj.dataLogin.user,
      shName: "tchmem",
    };
    serveFns
      .getUserData(objData)
      .then((data) => {
        //console.log(data);
        setMyData(JSON.parse(data));
        setShowTab(true);
        setOnSpin({ spin: false, message: "กำลังดึงข้อมูล โปรดรอซักครู่" });
      })
      .catch((error) => {
        console.error(error);
        setOnSpin({ spin: false, message: "กำลังดึงข้อมูล โปรดรอซักครู่" });
      });
  }, []);
  const [modal, contextHolder] = Modal.useModal();
  const delMem = async (ref) => {
    const confirmed = await modal.confirm({
      title: "ยืนยันลบไฟล์",
      icon: <ExclamationCircleOutlined />,
      content: `ต้องการลบบันทึกนี้`,
    });
    if (confirmed) {
      setOnSpin({ spin: true, message: "กำลังดำเนินการ โปรดรอซักครู่" });
      serveFns
        .delMem({ ref: ref, user: contextObj.dataLogin.user, shName: "tchmem" })
        .then((data) => {
          setMyData(JSON.parse(data));
          setOnSpin({ spin: false, message: "กำลังดำเนินการ โปรดรอซักครู่" });
          message(`ลบบันทึกนี้แล้ว`);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const columns = [
    {
      title: "วันที่",
      key: "tdate",
      render: (_, record) =>
        bdDate.DateShortTH(record.tdate.replace(/-/g, "/")),
    },
    {
      title: "ชั้น",
      dataIndex: "tclass",
      key: "tclass",
    },
    {
      title: "ชั่วโมงที่",
      dataIndex: "tpr",
      key: "tpr",
    },
    {
      title: "วิชา",
      dataIndex: "subj",
      key: "subj",
    },
    {
      title: "นักเรียน",
      render: (_, record) => (
        <>
          <p>{`ขาด ${
            record.kad !== "" ? record.kad.split(",").length : "-"
          } คน`}</p>
          <p>{`ลา ${
            record.la !== "" ? record.la.split(",").length : "-"
          } คน`}</p>
        </>
      ),
    },
    {
      title: "ดำเนินการ",
      render: (_, record) => (
        <>
          <Space.Compact>
            <Tooltip title="ลบบันทึก">
              <Button
                variant="solid"
                color="danger"
                onClick={() => delMem(record.ref)}
              >
                <DeleteOutlined />
              </Button>
            </Tooltip>
          </Space.Compact>
        </>
      ),
    },
  ];

  return (
    <>
      <Spin2Wait onSpin={onSpin.spin} message={onSpin.message} />
      <Card
        hoverable
        title="บันทึกการสอน"
        styles={{
          body: { padding: 25, overflow: "hidden" },
          header: { padding: 25, backgroundColor: "#bae0ff" },
        }}
      >
        <Space orientation="vertical" size="middle">
          {showTab && (
            <Table
              columns={columns}
              dataSource={myData}
              pagination={false}
              bordered
            />
          )}
        </Space>
      </Card>
      {contextHolder}
    </>
  );
};

export default ViewMyTeach;

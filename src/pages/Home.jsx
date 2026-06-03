import LoginForm from "@/components/doccommand/LoginForm";
import LoginContext from "@/LoginProvider";
import { useEffect, useState, useContext } from "react";
import {
  Modal,
  Space,
  Card,
  Button,
  Flex,
  Typography,
  Dropdown,
  Tooltip,
  Tabs,
  BorderBeam,
} from "antd";
import {
  ScheduleOutlined,
  SolutionOutlined,
  TeamOutlined,
} from "@ant-design/icons";

import DashBoard from "@/components/inhome/DashBoard";
import JobToSend from "@/components/inhome/JobToSend";
import Inspect from "@/components/inhome/Inspect";

const tabsItems = [
  {
    key: "1",
    label: "Dashboard",
    icon: <ScheduleOutlined />,
    children: <DashBoard />,
  },
  {
    key: "2",
    label: "ส่งงาน",
    icon: <SolutionOutlined />,
    children: <JobToSend />,
  },
  {
    key: "3",
    label: "ตรวจงาน",
    icon: <TeamOutlined />,
    children: <Inspect />,
  },
];
const onChange = (key) => {
  console.log(key);
};
const Home = ({ setLogin }) => {
  const contextObj = useContext(LoginContext);

  const [loginVal, setLoginVal] = useState(contextObj.dataLogin.isLogin);
  const [loginShow, setLoginShow] = useState(false);

  const isLogin = (e) => {
    setLogin(e);
  };
  const cardStyle = {
    width: 620,
    boxShadow: "0 0 8px 0 rgba(0, 0, 0, 0.2), 0 0 20px 0 rgba(0, 0, 0, 0.19)",
  };
  const imgStyle = {
    display: "block",
    width: 273,
  };
  const boxStyle = {
    width: "100%",
    height: 400,
    borderRadius: 6,

    alignItems: "center",
  };

  return (
    <>
      {!loginVal && (
        <Flex justify="center" align="center" style={{ margin: "30px" }}>
          <BorderBeam
            color={[
              { color: "#22c55e", percent: 0 },
              { color: "#357ce6", percent: 54 },
              { color: "#153bfa", percent: 100 },
            ]}
          >
            <Card
              title="KWP Doc Online"
              hoverable
              style={{
                width: 620,
                borderRadius: 24,
                background: "linear-gradient(#ff7a45, #b993d6)",
              }}
            >
              <Flex justify="space-between">
                <img
                  alt="KWP Logo"
                  src="https://drive.google.com/thumbnail?id=1fNqpPoT98B_9pjrZHbnPtcjzkVp6h8GA"
                  style={imgStyle}
                />
                <Flex
                  vertical
                  align="flex-end"
                  justify="space-between"
                  style={{ padding: 32 }}
                >
                  <Typography.Title level={3}>
                    คุณยังไม่ลงชื่อเข้าใช้ โปรดลงชื่อเข้าใช้
                  </Typography.Title>
                  <Button variant="solid" onClick={() => setLoginShow(true)}>
                    ลงชื่อเข้าใช้
                  </Button>
                </Flex>
              </Flex>
            </Card>
          </BorderBeam>
        </Flex>
      )}
      {loginVal && (
        <>
          <Space size="middle" orientation="vertical">
            {/*  <DocNewList />
            <MemNewList /> */}
          </Space>
          <Tabs
            defaultActiveKey="1"
            items={tabsItems}
            onChange={onChange}
            destroyOnHidden={true}
          />
        </>
      )}

      <Modal
        title="ลงชื่อเข้าใช้"
        open={loginShow}
        onCancel={() => setLoginShow(false)}
        footer={null}
        closable={false}
        keyboard={false}
        styles={{
          header: { backgroundColor: "transparent" },
          container: { background: "linear-gradient(#d0ed29ff, #f0189aff)" },
        }}
      >
        <LoginForm
          onHide={() => setLoginShow(false)}
          isLogin={(e) => isLogin(e)}
        />
      </Modal>
    </>
  );
};

export default Home;

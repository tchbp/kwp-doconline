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
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import ChangePassword from "@/components/doccommand/ChangePassword";
import DocNewList from "@/components/doccommand/DocNewList";
import MemNewList from "@/components/MemNewList";

const Home = ({ setLogin }) => {
  const contextObj = useContext(LoginContext);

  const [loginVal, setLoginVal] = useState(contextObj.dataLogin.isLogin);
  const [loginShow, setLoginShow] = useState(false);
  const [chPasswdShow, setChPasswdShow] = useState(false);
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

  const logOut = () => {
    let objTmp = contextObj.dataLogin;
    objTmp.isLogin = false;
    contextObj.setLogin(objTmp);
    //setCookie("ckLogin", objTmp);
    //console.log(JSON.stringify(cookies));
    setLogin(false);
  };
  const handleMenuClick = (e) => {
    console.log("click", e.key);
    switch (e.key) {
      case "0":
        logOut();
        break;
      case "1":
        setChPasswdShow(true);
    }
  };
  const itemsMenu = [
    {
      label: "ลงชื่อออก",
      key: "0",
    },
    {
      label: "เปลี่ยนรหัสผ่าน",
      key: "1",
    },
  ];

  return (
    <>
      {!loginVal && (
        <Flex justify="center" align="center">
          <Card
            title="KWP Document Online"
            hoverable
            style={cardStyle}
            styles={{
              body: {
                padding: 0,
                overflow: "hidden",
                background: "linear-gradient(#ff7a45, #b993d6)",
              },
              header: { backgroundColor: "#ff7a45" },
            }}
          >
            <Flex justify="space-between">
              <img
                alt="avatar"
                src="https://drive.google.com/thumbnail?id=1xr1JK0Uapoa4cdLEQyFghfRm4DaiAA4Z"
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
        </Flex>
      )}
      {loginVal && (
        <>
          <Space size="middle" direction="vertical">
            <Flex
              justify="flex-end"
              style={{
                backgroundColor: "#87e8de",
                padding: 25,
                boxShadow:
                  "0 0 8px 0 rgba(0, 0, 0, 0.2), 0 0 20px 0 rgba(0, 0, 0, 0.19)",
              }}
            >
              <Dropdown
                menu={{ items: itemsMenu, onClick: handleMenuClick }}
                trigger={["click"]}
              >
                <Tooltip title="คลิกเพื่อแสดงเมนู">
                  <a>
                    <Space>
                      <UserOutlined />
                      {contextObj.dataLogin.name}
                    </Space>
                  </a>
                </Tooltip>
              </Dropdown>
            </Flex>

            <DocNewList />
            <MemNewList />
          </Space>
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
          content: { background: "linear-gradient(#8CA6DB, #b993d6)" },
        }}
      >
        <LoginForm
          onHide={() => setLoginShow(false)}
          isLogin={(e) => isLogin(e)}
        />
      </Modal>
      <Modal
        title="แก้ไขข้อมูลผู้ใช้"
        open={chPasswdShow}
        onCancel={() => setChPasswdShow(false)}
        footer={null}
        closable={false}
        keyboard={false}
        styles={{
          header: { backgroundColor: "transparent" },
          content: { background: "linear-gradient(#8CA6DB, #b993d6)" },
        }}
      >
        <ChangePassword onHide={() => setChPasswdShow(false)} />
      </Modal>
    </>
  );
};

export default Home;

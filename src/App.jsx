// App.js
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { useState, useContext } from "react";
import { routes } from "@/routes";
import {
  Layout,
  Menu,
  theme,
  Flex,
  Typography,
  Card,
  Dropdown,
  Tooltip,
  Space,
  Modal,
} from "antd";
import Home from "./pages/Home";

import { UserOutlined } from "@ant-design/icons";
import LoginContext from "@/LoginProvider";
import ChangePassword from "@/components/doccommand/ChangePassword";
const { Header, Content, Footer, Sider } = Layout;

const App = () => {
  const contextObj = useContext(LoginContext);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const [login, setLogin] = useState(false);
  const items = routes.map((route, index) => ({
    key: String(index + 1),
    label: <Link to={route.url}>{route.title}</Link>,
  }));

  const [chPasswdShow, setChPasswdShow] = useState(false);
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
  const logOut = () => {
    let objTmp = {};
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

  return (
    <>
      {!contextObj.dataLogin.isLogin && <Home setLogin={(e) => setLogin(e)} />}
      {contextObj.dataLogin.isLogin && (
        <Router>
          <Layout>
            <Sider
              breakpoint="lg"
              collapsedWidth="0"
              onBreakpoint={(broken) => {
                console.log(broken);
              }}
              onCollapse={(collapsed, type) => {
                console.log(collapsed, type);
              }}
            >
              {/*   <Navbar /> */}

              <Menu
                theme="dark"
                mode="inline"
                defaultSelectedKeys={["1"]}
                items={items}
              />
            </Sider>
            <Layout>
              <Header style={{ padding: 0, background: "#f5f5f5" }}>
                <Card
                  hoverable
                  styles={{
                    body: {
                      padding: 0,
                      overflow: "hidden",
                      backgroundColor: "Orange",
                    },
                  }}
                >
                  <Flex vertical gap="small">
                    <Flex justify="flex-start" align="center">
                      <img
                        src="https://drive.google.com/thumbnail?id=1fNqpPoT98B_9pjrZHbnPtcjzkVp6h8GA"
                        style={{ width: 100, display: "block" }}
                        alt="logo"
                      />

                      <Typography.Title level={3} style={{ padding: 30 }}>
                        KWP Document Online
                      </Typography.Title>
                    </Flex>
                    <Flex
                      justify="flex-end"
                      align="flex-start"
                      style={{
                        height: "40px",
                        backgroundColor: "#afdada",
                        padding: 5,
                        boxShadow:
                          "0 0 8px 0 rgba(0, 0, 0, 0.2), 0 0 20px 0 rgba(0, 0, 0, 0.19)",
                      }}
                    >
                      {contextObj.dataLogin.isLogin && (
                        <Dropdown
                          menu={{
                            items: itemsMenu,
                            onClick: handleMenuClick,
                          }}
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
                      )}
                    </Flex>
                  </Flex>
                </Card>
              </Header>
              <Content style={{ margin: "80px 4px 0" }}>
                <div
                  style={{
                    padding: "15px 5px 5px 5px",
                    minHeight: 810,
                    background: "#f5f5f5",
                    borderRadius: borderRadiusLG,
                    alignItems: "center",
                  }}
                >
                  <Routes>
                    {routes.map((route) => (
                      <Route
                        path={route.url}
                        element={
                          <route.component setLogin={(e) => setLogin(e)} />
                        }
                        key={route.title}
                      />
                    ))}
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </div>
              </Content>
              <Footer style={{ textAlign: "center", background: "#f5f5f5" }}>
                Ant Design ©{new Date().getFullYear()} Created by Ant UED
                <br />
                Editor by @S-Viper
              </Footer>
            </Layout>
          </Layout>
        </Router>
      )}
      <Modal
        title="แก้ไขข้อมูลผู้ใช้"
        open={chPasswdShow}
        onCancel={() => setChPasswdShow(false)}
        footer={null}
        closable={false}
        keyboard={false}
        styles={{
          header: { backgroundColor: "transparent" },
          container: { background: "linear-gradient(#d0ed29ff, #f0189aff)" },
        }}
      >
        <ChangePassword onHide={() => setChPasswdShow(false)} />
      </Modal>
    </>
  );
};

export default App;

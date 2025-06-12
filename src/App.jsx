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
import Home from "./pages/Home";
import { Layout, Menu, theme, Flex, Typography, Card } from "antd";
import LoginContext from "@/LoginProvider";

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
                  <Flex justify="flex-start" align="center">
                    <img
                      src="https://drive.google.com/thumbnail?id=1xr1JK0Uapoa4cdLEQyFghfRm4DaiAA4Z"
                      style={{ width: 100, display: "block" }}
                      alt="logo"
                    />

                    <Typography.Title level={3} style={{ padding: 30 }}>
                      KWP Document Online
                    </Typography.Title>
                  </Flex>
                </Card>
              </Header>
              <Content style={{ margin: "24px 16px 0" }}>
                <div
                  style={{
                    padding: 24,
                    minHeight: 800,
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
    </>
  );
};

export default App;

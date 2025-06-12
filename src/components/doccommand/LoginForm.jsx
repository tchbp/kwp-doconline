import React, { useContext, useState } from "react";
import { Button, Form, Input, message, Flex } from "antd";
import LoginContext from "@/LoginProvider";
import * as serveFns from "@/server/gas";
import md5 from "md5";

const LoginForm = ({ onHide, isLogin }) => {
  const contexObj = useContext(LoginContext);

  const [form] = Form.useForm();
  const [login, setLogin] = useState(false);
  const [upLoading, setUpLoading] = useState(false);
  const onFinish = (values) => {
    const obj2Login = {
      username: values.username,
      password: md5(values.password),
    };
    setUpLoading(true);
    serveFns
      .chkLogin(obj2Login)
      .then((data) => {
        const objData = JSON.parse(data);
        contexObj.setLogin(objData);

        setUpLoading(false);
        if (objData.isLogin) {
          message.success(`ยินดีต้อนรับ ${objData.name} เข้าสู่ระบบอีกครั้ง`);
          isLogin(objData.isLogin);
          setLogin(true);
          form.resetFields();
          onHide();
        } else {
          message.error("ไม่พบผู้ใช้หรือระหัสผ่านไม่ถูกต้อง");
        }
      })
      .catch((error) => {
        console.error(error);
        message.error(error);
        setUpLoading(false);
      });
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  return (
    <>
      <Flex>
        <Form
          form={form}
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{
            maxWidth: 600,
          }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="ชื่อผู้ใช้"
            name="username"
            rules={[{ required: true, message: "โปรดลงชื่อผู้ใช้!" }]}
          >
            <Input
              style={{
                boxShadow:
                  "0 0 8px 0 rgba(0, 0, 0, 0.2), 0 0 20px 0 rgba(0, 0, 0, 0.19)",
              }}
            />
          </Form.Item>

          <Form.Item
            label="รหัสผ่าน"
            name="password"
            rules={[{ required: true, message: "โปรดกรอกรหัสผ่าน!" }]}
          >
            <Input.Password
              style={{
                boxShadow:
                  "0 0 8px 0 rgba(0, 0, 0, 0.2), 0 0 20px 0 rgba(0, 0, 0, 0.19)",
              }}
            />
          </Form.Item>

          <Form.Item label={null}>
            <Button
              type="primary"
              htmlType="submit"
              loading={upLoading}
              disabled={upLoading}
              style={{
                boxShadow:
                  "0 4px 8px 0 rgba(181, 141, 237, 0.7), 0 6px 20px 0 rgba(181, 141, 237, 0.9)",
                cursor: "pointer",
              }}
            >
              {upLoading ? "กำลังลงชื่อเข้าใช้" : "ลงชื่อเข้าใช้"}
            </Button>
          </Form.Item>
        </Form>
      </Flex>
    </>
  );
};
export default LoginForm;

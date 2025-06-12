import React, { useContext, useState, useEffect } from "react";
import { Button, Form, Input, message, Checkbox } from "antd";
import LoginContext from "@/LoginProvider";
import * as serveFns from "@/server/gas";
import md5 from "md5";

const ChangePassword = ({ onHide }) => {
  const contexObj = useContext(LoginContext);
  const [form] = Form.useForm();
  const [upLoading, setUpLoading] = useState(false);
  const [chUser, setChUser] = useState(false);
  const dataLogin = contexObj.dataLogin;
  useEffect(() => {
    form.setFieldsValue({ username: dataLogin.user });
  }, []);
  const onFinish = (values) => {
    const objData = {
      username: dataLogin.user,
      newUsername: chUser ? values.username : "",
      oldPassword: md5(values.password),
      newPassword: md5(values.newPassword),
    };
    setUpLoading(true);
    serveFns
      .chPasswd(objData)
      .then((isChange) => {
        if (isChange) {
          if (chUser) {
            const objData = contexObj.dataLogin;
            objData.user = values.username;
            contexObj.setLogin(objData);
          }
          message.success(
            `คุณเปลี่ยน ${chUser ? "username และ" : ""}password แล้ว`
          );

          onHide();
        } else {
          message.error("password เดิมไม่ถูกตอง");
        }
        setUpLoading(false);
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
      <Checkbox checked={chUser} onChange={(e) => setChUser(e.target.checked)}>
        เปลี่ยนชื่อผู้ใช้
      </Checkbox>
      <Form
        form={form}
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
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
            disabled={!chUser}
            style={{
              boxShadow:
                "0 0 8px 0 rgba(0, 0, 0, 0.2), 0 0 20px 0 rgba(0, 0, 0, 0.19)",
            }}
          />
        </Form.Item>

        <Form.Item
          label="รหัสผ่านเดิม"
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

        <Form.Item
          label="รหัสผ่านใหม่"
          name="newPassword"
          rules={[{ required: true, message: "โปรดกรอกรหัสผ่าน!" }]}
        >
          <Input.Password
            style={{
              boxShadow:
                "0 0 8px 0 rgba(0, 0, 0, 0.2), 0 0 20px 0 rgba(0, 0, 0, 0.19)",
            }}
          />
        </Form.Item>

        <Form.Item
          label="รหัสผ่านใหม่ อีกครั้ง"
          name="confirm"
          dependencies={["newPassword"]}
          hasFeedback
          rules={[
            { required: true, message: "โปรดกรอกรหัสผ่าน!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("ยืนยันรหัสผ่านใหม่ไม่ตรงกัน!")
                );
              },
            }),
          ]}
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
          >
            {upLoading ? "กำลังดำเนินการ" : "ดำเนินการปรับปรุง"}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default ChangePassword;

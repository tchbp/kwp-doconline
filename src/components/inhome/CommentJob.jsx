import { useState } from "react";
// import { Link } from "react-router-dom";
import { Flex, Form, Input, Button, message } from "antd";

// import Marquee from "react-fast-marquee";
// import {
//   FileOutlined,
//   SearchOutlined,
//   FileAddOutlined,
//   CheckCircleOutlined,
//   WarningOutlined,
//   FormOutlined,
//   ClockCircleOutlined,
// } from "@ant-design/icons";
import * as serveFns from "@/server/gas";

const CommentJob = ({ user, pos, fileid, memo, comm, commD, onClose }) => {
  const [upLoading, setUpLoading] = useState(false);

  const [form] = Form.useForm();
  form.setFieldsValue({ commentA: comm || "-", commentDA: commD || "-" });
  console.log(
    `User is ${user}\n pos is ${pos}\n comm is ${comm}\n commD is ${commD}\n fileid is ${fileid}`,
  );
  const onFinish = (values) => {
    setUpLoading(true);
    const objData = {
      user: user,
      pos: pos,
      comm: values.commentA,
      commD: values.commentDA,
      fileid: fileid,
    };

    //console.log(`    objData is ${JSON.stringify(objData)}`);
    //console.log(`    values is ${JSON.stringify(values)}`);
    serveFns
      .saveComment(objData)
      .then((isSave) => {
        if (isSave) {
          message.success("บันทึกความเห็นแล้ว");
          onClose?.(fileid, values.commentA, values.commentDA); // ส่งข้อมูลกลับไปยัง parent component
        } else {
          message.error("เกิดข้อผิดพลาดในการบันทึกความเห็น");
        }
      })
      .catch((error) => {
        console.error(error);
        message.error("เกิดข้อผิดพลาดในการบันทึกความเห็น");
      });
    // ✅ ปิด modal
    // setTimeout(() => {
    //   onClose?.();
    // }, 500); // รอให้ message หายก่อน
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <>
      <Flex vertical gap={16}>
        <p>{memo}</p>
        <br />
        <Form
          form={form}
          layout={"vertical"}
          name="basic"
          style={{ maxWidth: 900 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="ความเห็นผู้ตรวจ/ผู้ได้รับมอบหมาย"
            name="commentA"
            rules={[
              { required: true, message: "โปรดกรอกความเห็น/ข้อเสนอแนะ!" },
            ]}
          >
            <Input.TextArea rows={4} readOnly={pos !== 2} />
          </Form.Item>
          <Form.Item
            label="ความเห็นผู้อำนวยการ"
            name="commentDA"
            rules={[
              { required: true, message: "โปรดกรอกความเห็น/ข้อเสนอแนะ!" },
            ]}
          >
            <Input.TextArea rows={4} readOnly={pos !== 1} />
          </Form.Item>
          <Flex gap="small" justify="flex-end" wrap>
            {pos !== 3 && (
              <Form.Item label={null}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={upLoading}
                  disabled={upLoading}
                >
                  {upLoading ? "กำลังส่งบันทึก" : "บันทึก"}
                </Button>
              </Form.Item>
            )}
            <Form.Item label={null}>
              <Button color="danger" variant="solid" onClick={onClose}>
                ยกเลิก
              </Button>
            </Form.Item>
          </Flex>
        </Form>
      </Flex>
    </>
  );
};

export default CommentJob;

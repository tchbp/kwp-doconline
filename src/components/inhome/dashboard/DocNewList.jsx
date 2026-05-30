import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, Flex, Tooltip, Button, Alert, List, Divider } from "antd";
import Marquee from "react-fast-marquee";
import { FileOutlined } from "@ant-design/icons";
import * as serveFns from "@/server/gas";

const DocNewList = () => {
  const [dataDoc, setDataDoc] = useState([]);

  useEffect(() => {
    serveFns
      .getDataNew5("doccommand")
      .then((data) => {
        console.log(data);
        setDataDoc(JSON.parse(data).reverse());
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <Card
      title="ไฟล์คำสั่งล่าสุด"
      hoverable
      styles={{
        body: { padding: 25, overflow: "hidden" },
        header: { padding: 25, backgroundColor: "DodgerBlue" },
      }}
    >
      {/* <List
        itemLayout="vertical"
        dataSource={dataDoc}
        size="small"
        renderItem={(doc) => (
          <List.Item>
            <List.Item.Meta title={`  ${doc.nocmd}  ${doc.title}     `} />
            <Tooltip title="เปิดไฟล์">
              <Button
                type="primary"
                onClick={() => {
                  window.open(doc.fileurl, "_blank");
                  console.log(doc.fileurl);
                }}
              >
                <FileOutlined />
              </Button>
            </Tooltip>
          </List.Item>
        )} */}
      {dataDoc.map((value, index) => (
        <div key={index} style={{ marginBottom: "16px" }}>
          <Divider style={{ borderColor: "#7cb305" }} titlePlacement="start">
            <Tooltip title="เปิดไฟล์">
              <Button
                type="text"
                icon={<FileOutlined />}
                onClick={() => window.open(value.fileurl, "_blank")}
              >
                คำสั่งที่ {value.nocmd}
              </Button>
            </Tooltip>
          </Divider>
          <p
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{value.title}</span>
          </p>
        </div>
      ))}

      <Flex justify="flex-end">
        <Link to="/listdocument">เพิ่มเติม...</Link>
      </Flex>
    </Card>
  );
};

export default DocNewList;

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, Flex, Tooltip, Button } from "antd";
import { FileOutlined } from "@ant-design/icons";
import * as serveFns from "@/server/gas";
import * as bdDate from "@/BuddhistDate";

const DocNewList = () => {
  const [dataDoc, setDataDoc] = useState([]);

  useEffect(() => {
    serveFns
      .getDataNew5("doccommand")
      .then((data) => {
        console.log(data);
        setDataDoc(JSON.parse(data));
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <Card
      title="ไฟล์คำสั่ง"
      hoverable
      styles={{
        body: { padding: 25, overflow: "hidden" },
        header: { padding: 25, backgroundColor: "DodgerBlue" },
      }}
    >
      <Flex wrap gap="small">
        {dataDoc.map((doc) => (
          <>
            {" "}
            <Card
              title={doc.nocmd}
              hoverable
              style={{ width: 240, backgroundColor: "#f6ffed" }}
              styles={{
                body: {
                  padding: 25,
                  overflow: "hidden",
                  backgroundColor: "#f6ffed",
                },
                header: { backgroundColor: "#adc6ff" },
              }}
            >
              <Tooltip title="เปิดไฟล์">
                <Button
                  onClick={() => {
                    window.open(doc.fileurl, "_blank");
                    console.log(doc.fileurl);
                  }}
                >
                  <FileOutlined />
                </Button>
              </Tooltip>
              {doc.title}
            </Card>
          </>
        ))}
      </Flex>
      <Flex justify="flex-end">
        <Link to="/listdocument">เพิ่มเติม...</Link>
      </Flex>
    </Card>
  );
};

export default DocNewList;

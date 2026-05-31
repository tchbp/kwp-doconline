import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, Flex, Tooltip, Button, Divider } from "antd";
//import Marquee from "react-fast-marquee";
import { FileOutlined } from "@ant-design/icons";
import * as serveFns from "@/server/gas";
import { arrShName, arrSubfixBook } from "@/components/saraban/RepBooks";

const RepBooksNew = ({ typeBook }) => {
  const [dataDoc, setDataDoc] = useState([]);

  useEffect(() => {
    serveFns
      .getDataNew5(arrShName[typeBook])
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
      title={`  ${arrSubfixBook[typeBook]}ล่าสุด  `}
      hoverable
      styles={{
        body: { padding: 25, overflow: "hidden" },
        header: { padding: 25, backgroundColor: "DodgerBlue" },
      }}
    >
      {dataDoc.map((value, index) => (
        <div key={index} style={{ marginBottom: "16px" }}>
          <Divider style={{ borderColor: "#7cb305" }} titlePlacement="start">
            <Tooltip title="เปิดไฟล์">
              <p>
                ที่ {value.at}
                {JSON.parse(value.fileurl).map((url, i) => (
                  <Button
                    key={i}
                    type="text"
                    icon={<FileOutlined />}
                    onClick={() => window.open(url, "_blank")}
                  />
                ))}
              </p>
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
        <Link to="/saraban">เพิ่มเติม...</Link>
      </Flex>
    </Card>
  );
};

export default RepBooksNew;

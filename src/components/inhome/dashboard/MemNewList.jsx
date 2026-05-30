import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, Flex } from "antd";
import * as serveFns from "@/server/gas";
import * as bdDate from "@/BuddhistDate";

const MemNewList = () => {
  const [dataDoc, setDataDoc] = useState([]);

  useEffect(() => {
    serveFns
      .getDataNew5("tchmem")
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
      title="บันทึกการสอนล่าสุด"
      hoverable
      styles={{
        body: { padding: 25, overflow: "hidden" },
        header: { padding: 25, backgroundColor: "#ff85c0" },
      }}
    >
      <Flex wrap gap="small">
        {dataDoc.map((doc) => (
          <>
            {console.log(
              `tdate ${doc.tdate}\n ch2 => ${bdDate.DateLongTH(
                doc.tdate.replace(/-/g, "/")
              )}`
            )}
            <Card
              title={`${doc.tname}`}
              hoverable
              style={{ width: 240, backgroundColor: "#f6ffed" }}
              styles={{
                body: {
                  padding: 25,
                  overflow: "hidden",
                  backgroundColor: "#f6ffed",
                },
                header: { backgroundColor: "#ffd6e7" },
              }}
            >
              <p>{`${bdDate.DateLongTH(doc.tdate.replace(/-/g, "/"))} ชั้น ${
                doc.tclass
              } ชั่วโมงที่ ${doc.tpr}`}</p>
              <p>{`รายวิชา ${doc.subj}`}</p>
              <p>{`กิจกรรมการสอน :`}</p>
              <p>{`${doc.atc}`}</p>
            </Card>
          </>
        ))}
      </Flex>
      <Flex justify="flex-end">
        <Link to="/techmem">เพิ่มเติม...</Link>
      </Flex>
    </Card>
  );
};

export default MemNewList;

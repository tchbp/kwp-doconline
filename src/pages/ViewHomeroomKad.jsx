import { useState, useEffect } from "react";
import { Button, Typography, ConfigProvider } from "antd";
import * as bdDate from "@/BuddhistDate";

//import * as serveFns from "@/server/gas";
const { Title, Paragraph, Text } = Typography;

const ViewHomeroomKad = ({ stdClass, studentData, tdate, onClose }) => {
  //const [studentData, setStudentData] = useState([]);
  //const [strHtml, setStrHtml] = useState("");

  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };

  return (
    <Typography>
      <Title level={3}>วันที่ {bdDate.DateLongTH(tdate)}</Title>

      {stdClass.map((cls) => {
        const data = studentData.filter((row) => row.tclass === cls);
        console.log(`data for class ${cls}:`, data);
        if (data.length === 0) {
          return (
            <Paragraph>
              <br />
              <Text strong>ชั้น {cls} ครูที่ปรึกษายังไม่บันทึกข้อมูล</Text>
              <br />
            </Paragraph>
          );
        } else {
          return (
            <Paragraph>
              <Title level={4}>ชั้น {cls}</Title>
              <Text strong>ขาด</Text>
              {data[0].stdKad.length === 0 ? (
                <>
                  <br />
                  <Text strong>ไม่มีนักเรียนที่ขาด</Text>
                  <br />
                </>
              ) : (
                <>
                  <ul>
                    {data[0].stdKad.map((std, i) => {
                      //console.log(`${data[0].tclass} std:`, std);
                      return (
                        <li key={i}>
                          {data[0].kad[i]} : {std}
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
              <Text strong>ลา</Text>
              {data[0].stdLa.length === 0 ? (
                <>
                  <br />
                  <Text strong>ไม่มีนักเรียนที่ลา</Text>
                  <br />
                </>
              ) : (
                <>
                  <ul>
                    {data[0].stdLa.map((std, i) => {
                      //console.log(`${data[0].tclass} std:`, std);
                      return (
                        <li key={i}>
                          {data[0].la[i]} : {std}
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </Paragraph>
          );
        }
      })}

      <div style={{ ...tailLayout }}>
        <Button htmlType="button" type="primary" danger onClick={onClose}>
          ปิด
        </Button>
      </div>
    </Typography>
  );
};

export default ViewHomeroomKad;

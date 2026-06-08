import { useState, useEffect, useContext } from "react";
import { Card, Table, Flex, Collapse, message, Typography } from "antd";
import { Link } from "react-router-dom";
import * as serveFns from "@/server/gas";
import locale from "antd/locale/th_TH";
import dayjs from "dayjs";
import "dayjs/locale/th";
import * as bdDate from "@/BuddhistDate";

dayjs.locale("th");

const KadTop10 = () => {
  const [dataTop10, setDataTop10] = useState([]);

  useEffect(() => {
    serveFns
      .getSheetData("kadtop10")
      .then((data) => {
        setDataTop10(JSON.parse(data));
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  const items = dataTop10.map((item) => ({
    key: item.id,
    label: `${item.id} ${item["ชื่อ-สกุล"]} ชั้น ${item["ชั้น"]} ขาดเรียน ${item.จำนวนที่ขาด} ครั้ง`,
    children: <TableView dataStd={JSON.parse(item.รายละเอียด)} />,
  }));
  const onChange = (key) => {
    console.log(key);
  };
  return (
    <>
      <Card
        title="นักเรียนที่ขาดมากที่สุด 10 อันดับแรก"
        hoverable
        styles={{
          body: { padding: 25, overflow: "hidden" },
          header: { padding: 25, backgroundColor: "#ffc53d" },
        }}
      >
        <Collapse items={items} onChange={onChange} />
        <Flex justify="flex-end">
          <Link to="/techmem">เพิ่มเติม...</Link>
        </Flex>
      </Card>
    </>
  );
};

const TableView = ({ dataStd }) => {
  const columns = [
    {
      title: "วัน",
      dataIndex: "วัน",
      key: "วัน",
    },
    {
      title: "คาบเรียนที่ขาด จำนวนครั้ง",
      children: [...Array(9).keys()].map((i) => ({
        title: `คาบ${String(i + 1)}`,
        dataIndex: `คาบ${i + 1}`,
        key: `คาบ${i + 1}`,
        render(kad, record) {
          return {
            props: {
              style: {
                color: kad > 0 ? "red" : "black",
              },
            },
            children: <div>{kad > 0 ? kad : "-"}</div>,
          };
        },
      })),
    },
  ];
  return (
    <Table
      bordered
      columns={columns}
      dataSource={dataStd}
      scroll={{ x: "max-content" }}
      pagination={false}
    />
  );
};

export default KadTop10;

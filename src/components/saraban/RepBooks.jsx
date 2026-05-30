import { useState, useEffect, useContext } from "react";
import { Flex, Button, Typography, Modal } from "antd";
import { FileAddOutlined } from "@ant-design/icons";

import * as serveFns from "@/server/gas";
import FormAddBook from "./FormAddBook";

import Spin2Wait from "@/components/Spin2Wait";
import LoginContext from "@/LoginProvider";
import TableBookList from "./TableBookList";

const arrSubfixBook = [
  "หนังสือรับ",
  "หนังสือส่ง",
  "บันทึกข้อความ",
  "คำสั่ง",
  "ประกาศ",
];
const arrShName = [
  "repbooks",
  "sendbooks",
  "innerbooks",
  "cmdbooks",
  "annobooks",
];
const RepBooks = ({ bookType }) => {
  const [onSpin, setOnSpin] = useState(false);
  //const [isOperator, setIsOperator] = useState(false);
  const { Title } = Typography;
  const contextObj = useContext(LoginContext);
  const user = contextObj.dataLogin.user;
  const [dataBookList, setDataBookList] = useState([]);

  useEffect(() => {
    setOnSpin(true);

    serveFns
      .getSheetData(arrShName[bookType])
      .then((data) => {
        setDataBookList(JSON.parse(data).reverse());
        setOnSpin(false);
        console.log(`onSpin is ${onSpin}`);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const handleAddBook = () => {
    const modal = Modal.info({
      title: `เพิ่ม${arrSubfixBook[bookType]}`,
      icon: <FileAddOutlined />,
      content: (
        <FormAddBook
          cmdType={"add"}
          bookType={bookType}
          user={user}
          nextid={
            dataBookList.length > 0 ? parseInt(dataBookList[0].id) + 1 : 1
          }
          onClose={() => {
            modal.destroy();
          }}
          setDataBookList={setDataBookList}
        />
      ),
      width: 600,
      footer: null,
    });
  };

  return (
    <>
      <Flex vertical gap="middle">
        <Flex vertical gap="small" justify="center">
          <Title
            style={{
              backgroundColor: "#040ca4bf",
              color: "white",
              padding: "0 8px",
              width: "100%",
            }}
            level={2}
          >
            โรงเรียนกุมภวาปีพิทยาสรรค์
          </Title>
          <Title style={{ color: "#0f2af4bf" }} level={3}>
            ทะเบียน{arrSubfixBook[bookType]}
          </Title>
        </Flex>
        <Flex gap="small" justify="flex-start" wrap>
          <Button
            variant="solid"
            color="danger"
            icon={<FileAddOutlined />}
            onClick={() => {
              handleAddBook();
            }}
          >
            เพิ่ม{arrSubfixBook[bookType]}
          </Button>
        </Flex>
        <TableBookList
          user={user}
          bookType={bookType}
          dataBookList={dataBookList}
          setDataBookList={setDataBookList}
          setOnSpin={setOnSpin}
        />
      </Flex>
      <Spin2Wait onSpin={onSpin} message={"กำลังดึงข้อมูลโปรดรอซักครู่"} />
    </>
  );
};

export { arrShName, arrSubfixBook };
export default RepBooks;

import { useState, useEffect, useContext, useRef } from "react";
import {
  Flex,
  Modal,
  Button,
  Space,
  Typography,
  Table,
  Input,
  message,
  Tooltip,
  Popover,
} from "antd";
import {
  FileOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  UploadOutlined,
  EditOutlined,
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import UpFileBook from "./UpFileBook";
import FormAddBook from "./FormAddBook";
import * as serveFns from "@/server/gas";
import * as bdDate from "@/BuddhistDate";

import LoginContext from "@/LoginProvider";

const TableBookList = ({
  user,
  bookType,
  dataBookList,
  setDataBookList,
  setOnSpin,
}) => {
  const [isOperator, setIsOperator] = useState(false);
  const { Title } = Typography;

  const contextObj = useContext(LoginContext);
  useEffect(() => {
    setIsOperator(contextObj.dataLogin.level.includes("1"));
  }, []);
  //---------------Edit Function----------------
  const handleEdit = (data) => {
    const modal = Modal.info({
      title: "แก้ไขข้อมูล " + data.at,
      icon: <FileOutlined />,
      content: (
        <FormAddBook
          cmdType={"edit"}
          bookType={bookType}
          user={user}
          nextid={data.id}
          data2Edit={data}
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
  //---------------End Edit Function----------------

  //---------------UpFile Function----------------

  const handleUpFile = (id, at, title) => {
    const modal = Modal.info({
      title: "อัพโหลดไฟล์เอกสาร " + at,
      icon: <FileOutlined />,
      content: (
        <UpFileBook
          bookType={bookType}
          id={id}
          at={at}
          title={title}
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

  //---------------Delete Function----------------
  const [modal, contextHolder] = Modal.useModal();
  const delDocCommand = async (id, at) => {
    const confirmed = await modal.confirm({
      title: "ยืนยันลบไฟล์",
      icon: <ExclamationCircleOutlined />,
      content: `ต้องการลบเอกสาร ที่ ${at}`,
    });
    if (confirmed) {
      setOnSpin(true);
      serveFns
        .delBook(bookType, id)
        .then((data) => {
          setDataBookList(JSON.parse(data).reverse());

          message(`ลบเอกสาร ที่ ${at} แล้ว`);
          setOnSpin(false);
        })
        .catch((error) => {
          console.log(error);
          setOnSpin(false);
        });
    }
  };
  //---------------End Delete Function----------------
  //---------------Search Function on Table----------------
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };
  const getColumnSearchProps = (dataIndex, title) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`ค้นหาจาก ${title}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            ค้นหา
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            ล้าง
          </Button>
          {/* <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button> */}
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            ปิด
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => {
            var _a;
            return (_a = searchInput.current) === null || _a === void 0
              ? void 0
              : _a.select();
          }, 100);
        }
      },
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });
  //---------------End Search Function on Table----------------
  const columns = [
    Object.assign(
      {
        title: "เลขที่",
        dataIndex: "id",
        key: "id",
      },
      getColumnSearchProps("id", "เลขที่"),
    ),
    Object.assign(
      {
        title: "ที่",
        dataIndex: "at",
        key: "at",
      },
      getColumnSearchProps("at", "ที่"),
    ),
    {
      title: "ลงวันที่",

      key: "atdate",
      render: (_, record) =>
        bdDate.DateShortTH(record.atdate.replace(/-/g, "/")),
    },
    {
      title: "จาก",
      dataIndex: "from",
      key: "from",
    },
    {
      title: "ถึง",
      dataIndex: "to",
      key: "to",
    },
    Object.assign(
      {
        title: "เรื่อง",
        dataIndex: "title",
        key: "title",
        width: "40%",
      },
      getColumnSearchProps("title", "ชื่อเรื่อง"),
    ),
    Object.assign(
      {
        title: "การปฏิบัติ",
        dataIndex: "action",
        key: "action",
      },
      getColumnSearchProps("action", "การปฏิบัติ"),
    ),
    {
      title: "หมายเหตุ",
      dataIndex: "note",
      key: "note",
    },
    {
      title: "ไฟล์",

      key: "fileid",
      render: (_, record) => (
        <>
          <Space.Compact>
            {(user == record.user || isOperator) && (
              <Tooltip title="แก้ไขข้อมูล">
                <Button
                  onClick={() => {
                    handleEdit({
                      id: record.id,
                      at: record.at,
                      atdate: record.atdate,
                      from: record.from,
                      to: record.to,
                      title: record.title,
                      action: record.action,
                      note: record.note,
                      fileid: record.fileid,
                      fileurl: record.fileurl,
                      user: record.user,
                    });
                  }}
                  variant="solid"
                  color="green"
                  icon={<EditOutlined />}
                />
              </Tooltip>
            )}

            <Tooltip title="อัพโหลดไฟล์">
              <Button
                onClick={() => {
                  handleUpFile(record.id, record.at, record.title);
                }}
                variant="solid"
                color="purple"
                icon={<UploadOutlined />}
              />
            </Tooltip>
            {record.fileurl !== "[]" && (
              <Tooltip title="เปิดไฟล์">
                <Popover
                  content={
                    <div>
                      {JSON.parse(record.fileurl).map((url) => (
                        <Button
                          key={url}
                          onClick={() => {
                            window.open(url, "_blank");
                            //console.log(url);
                          }}
                          variant="solid"
                          color="primary"
                          icon={<FileOutlined />} // ถ้าไม่มี icon ให้หยุดการทำงาน
                        />
                      ))}
                    </div>
                  }
                  trigger="click"
                  title="เปิดไฟล์"
                >
                  <Button
                    variant="solid"
                    color="primary"
                    icon={<FileOutlined />}
                  />
                </Popover>
              </Tooltip>
            )}
            {isOperator && (
              <Tooltip title="ลบไฟล์">
                <Button
                  variant="solid"
                  color="danger"
                  icon={<DeleteOutlined />}
                  onClick={() => delDocCommand(record.id, record.at)}
                />
              </Tooltip>
            )}
          </Space.Compact>
        </>
      ),
    },
  ];

  return (
    <>
      <Table
        dataSource={dataBookList}
        columns={columns}
        scroll={{ x: "max-content" }}
      />

      {contextHolder}
    </>
  );
};

export default TableBookList;

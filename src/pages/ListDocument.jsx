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
} from "antd";
import {
  FileOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import UpCommand from "@/components/doccommand/UpCommand";
import * as serveFns from "@/server/gas";
import * as bdDate from "@/BuddhistDate";
import Spin2Wait from "@/components/Spin2Wait";
import LoginContext from "@/LoginProvider";

const ListDocument = () => {
  const [modalShow, setModalShow] = useState(false);
  const [dataCommand, setDataCommand] = useState(null);
  const [onSpin, setOnSpin] = useState(false);
  const [isOperator, setIsOperator] = useState(false);
  const { Title, Link } = Typography;

  const contextObj = useContext(LoginContext);
  useEffect(() => {
    setIsOperator(contextObj.dataLogin.level.includes("1"));
    isSpin(true);
    serveFns
      .getSheetData("doccommand")
      .then((data) => {
        setDataCommand(JSON.parse(data));
        isSpin(false);
        console.log(`onSpin is ${onSpin}`);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  const [modal, contextHolder] = Modal.useModal();
  const delDocCommand = async (nocmd) => {
    const confirmed = await modal.confirm({
      title: "ยืนยันลบไฟล์",
      icon: <ExclamationCircleOutlined />,
      content: `ต้องการลบไฟล์คำสั่ง เลขที่ ${nocmd}`,
    });
    if (confirmed) {
      isSpin(true);
      serveFns
        .delDocCommand(nocmd)
        .then((data) => {
          setDataCommand(JSON.parse(data));
          isSpin(false);
          message(`ลบไฟล์คำสั่งเลขที่ ${nocmd} แล้ว`);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

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
  const columns = [
    Object.assign(
      {
        title: "เลขที่",
        dataIndex: "nocmd",
        key: "nocmd",
      },
      getColumnSearchProps("nocmd", "เลขที่คำสั่ง")
    ),
    {
      title: "ลงวันที่",

      key: "atdate",
      render: (_, record) =>
        bdDate.DateShortTH(record.atdate.replace(/-/g, "/")),
    },
    Object.assign(
      {
        title: "เรื่อง",
        dataIndex: "title",
        key: "title",
        width: "40%",
      },
      getColumnSearchProps("title", "ชื่อเรื่อง")
    ),
    {
      title: "กลุ่มงานต้นเรื่อง",
      dataIndex: "workgroup",
      key: "workgroup",
      filters: [
        { text: "กลุ่มบริหารวิชาการ", value: "กลุ่มบริหารวิชาการ" },
        { text: "กลุ่มบริหารงานบุคคล", value: "กลุ่มบริหารงานบุคคล" },
        { text: "กลุ่มบริหารงบประมาณ", value: "กลุ่มบริหารงบประมาณ" },
        { text: "กลุ่มบริหารทั่วไป", value: "กลุ่มบริหารทั่วไป" },
      ],
      onFilter: (value, record) => record.workgroup.includes(value),
      // filtersSearch: true,
      // filterSearchPlaceholder: "ค้นหากลุ่มงาน",
    },
    {
      title: "บันทึกเพิ่มเติม",
      dataIndex: "memo",
      key: "memo",
    },
    {
      title: "ไฟล์",

      key: "fileid",
      render: (_, record) => (
        <>
          <Space.Compact>
            <Tooltip title="เปิดไฟล์">
              <Button
                onClick={() => {
                  window.open(record.fileurl, "_blank");
                  console.log(record.fileurl);
                }}
                variant="solid"
                color="primary"
              >
                <FileOutlined />
              </Button>
            </Tooltip>
            {isOperator && (
              <Tooltip title="ลบไฟล์">
                <Button
                  variant="solid"
                  color="danger"
                  onClick={() => delDocCommand(record.nocmd)}
                >
                  <DeleteOutlined />
                </Button>
              </Tooltip>
            )}
          </Space.Compact>
        </>
      ),
    },
  ];
  const showModalUpFile = () => {
    setModalShow(true);
  };
  const hideModalUpFile = () => {
    setModalShow(false);
  };
  const isSpin = (e) => {
    setOnSpin(e);
  };
  return (
    <>
      <Space direction="vertical">
        <Title>เอกสาร Online ไฟล์คำสั่ง โรงเรียนกุมภวาปีพิทยาสรรค์</Title>
        <Flex gap="middle" align="center" vertical>
          <Modal
            title="Up Load ไฟล์"
            open={modalShow}
            onCancel={hideModalUpFile}
            footer={null}
          >
            <UpCommand
              onHide={hideModalUpFile}
              setDataCommand={setDataCommand}
            />
          </Modal>
          <Space.Compact block>
            <p>อัพโหลดไฟล์คำสั่ง</p>
            <Tooltip title="เพิ่มไฟล์คำสั่ง">
              <Button variant="success" onClick={showModalUpFile}>
                คลิก UpLoad
              </Button>
            </Tooltip>
          </Space.Compact>
        </Flex>
        <Space direction="vertical" size="middle" style={{ display: "flex" }}>
          <Table dataSource={dataCommand} columns={columns} />
          <Spin2Wait onSpin={onSpin} message={"กำลังดึงข้อมูลโปรดรอซักครู่"} />
        </Space>
        {contextHolder}
      </Space>
    </>
  );
};

export default ListDocument;

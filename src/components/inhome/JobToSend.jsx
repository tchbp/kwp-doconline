import LoginContext from "@/LoginProvider";
import { useState, useEffect, useContext, useRef } from "react";
import CommentJob from "@/components/inhome/CommentJob";
// import { Link } from "react-router-dom";
import {
  Card,
  Space,
  Tooltip,
  Button,
  Modal,
  Table,
  Input,
  message,
  Tag,
  Collapse,
  List,
  Form,
  Select,
} from "antd";
// import Marquee from "react-fast-marquee";
import {
  FileOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  FileAddOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import * as serveFns from "@/server/gas";
import Highlighter from "react-highlight-words";
import UpFileJob from "@/components/inhome/UpFileJob";
import Spin2Wait from "@/components/Spin2Wait";

const JobToSend = () => {
  const contextObj = useContext(LoginContext);
  const [modalShow, setModalShow] = useState(false);
  const [dataJob, setDataJob] = useState(null);
  const [onSpin, setOnSpin] = useState(false);
  const [typeJob, setTypeJob] = useState([]);

  const isSpin = (e) => {
    setOnSpin(e);
  };
  // **************************** constant to comment ********************
  const user2comm = contextObj.dataLogin.user;

  const handleCommentClick = (fileid, comm, commD, memo) => {
    const modal = Modal.info({
      title: "ความคิดเห็นของผู้ตรวจ/ผู้อำนวยการ",
      icon: <CommentOutlined />,
      content: (
        <CommentJob
          pos={3} // กำหนด pos เป็น 3 สำหรับอ่านอย่างเดียว
          user={user2comm}
          comm={comm}
          commD={commD}
          fileid={fileid}
          memo={memo}
          onClose={(fileid = "", comm = "", commD = "") => {
            modal.destroy();
          }} // ปิด modal
        />
      ),
      footer: null, // ซ่อน footer ถ้าไม่ต้องการ
    });
  };

  //******************* end constant to comment ********************
  useEffect(() => {
    isSpin(true);

    serveFns
      .getConst("joblist")
      .then((joblist) => {
        setTypeJob(JSON.parse(joblist));
        serveFns
          .getSheetDataJob(contextObj.dataLogin.user)
          .then((data) => {
            setDataJob(JSON.parse(data).reverse());
            isSpin(false);
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  //---------------Delete Function----------------
  const [modal, contextHolder] = Modal.useModal();
  const delDocJob = async (memo, fileid) => {
    const confirmed = await modal.confirm({
      title: "ยืนยันลบไฟล์",
      icon: <ExclamationCircleOutlined />,
      content: `ต้องการลบไฟล์ ${memo}`,
    });
    if (confirmed) {
      isSpin(true);
      serveFns
        .delDocJob(contextObj.dataLogin.user, fileid)
        .then((data) => {
          setDataJob(JSON.parse(data).reverse());
          isSpin(false);
          message(`ลบไฟล์เอกสารแล้ว`);
        })
        .catch((error) => {
          console.log(error);
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
    {
      title: "ประเภทงาน",
      dataIndex: "typeJob",
      key: "typeJob",
      width: 150,
      filters: typeJob.map((item) => ({
        text: item.desc,
        value: item.job,
      })),
      onFilter: (value, record) => record.typeJob.includes(value),
    },
    Object.assign(
      {
        title: "รายละเอียด",
        dataIndex: "memo",
        key: "memo",
        width: 280,
      },
      getColumnSearchProps("memo", "รายละเอียด"),
    ),
    {
      title: "ไฟล์",
      width: 80,
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
            <Tooltip title="ความคิดเห็นของผู้ตรวจ/ผู้อำนวยการ">
              <Button
                variant="solid"
                color="purple"
                icon={<CommentOutlined />}
                onClick={() => {
                  handleCommentClick(
                    record.fileid,
                    record.comment,
                    record.commentD,
                    record.memo,
                  );
                }}
              />
            </Tooltip>
            <Tooltip title="ลบไฟล์">
              <Button
                variant="solid"
                color="danger"
                onClick={() => delDocJob(record.memo, record.fileid)}
              >
                <DeleteOutlined />
              </Button>
            </Tooltip>
          </Space.Compact>
        </>
      ),
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      width: 140,
      key: "status",
      render: (_, record) => {
        let color = "green";
        let icon = <CheckCircleOutlined />;
        if (record.status === "รอตรวจ") {
          color = "orange";
          icon = <ClockCircleOutlined />;
        } else if (record.status === "ตรวจผ่าน") {
          color = "blue";
          icon = <CheckCircleOutlined />;
        } else if (record.status === "ปรับปรุง") {
          color = "red";
          icon = <WarningOutlined />;
        }
        return (
          <Tooltip
            title={`ส่ง:${record.date} ผู้ตรวจ user:${
              record.inspecter || "-"
            }@${record.dateinspect || "-"}`}
          >
            <Tag color={color} icon={icon}>
              {record.status}
            </Tag>
          </Tooltip>
        );
      },
    },
  ];
  const showModalUpFile = () => {
    setModalShow(true);
  };
  const hideModalUpFile = () => {
    setModalShow(false);
  };

  return (
    <>
      <Card
        title="ส่งงาน"
        hoverable
        styles={{
          body: { padding: 25, overflow: "hidden" },
          header: { padding: 25, backgroundColor: "#ffc53d" },
        }}
      >
        <Space.Compact block>
          <Tooltip title="เพิ่มไฟล์งาน">
            <Button
              color="pink"
              variant="solid"
              onClick={showModalUpFile}
              icon={<FileAddOutlined />}
              style={{ marginBottom: 10 }}
            >
              UpLoad ไฟล์งาน
            </Button>
          </Tooltip>
        </Space.Compact>
        <Space orientation="vertical" size="middle" style={{ display: "flex" }}>
          <Table
            dataSource={dataJob}
            columns={columns}
            style={{ width: "100%" }}
            scroll={{ x: 970 }}
            size="small"
            tableLayout="fixed"
            pagination={{ pageSize: 10 }}
          />
          <Spin2Wait onSpin={onSpin} message={"กำลังดึงข้อมูลโปรดรอซักครู่"} />
        </Space>
      </Card>
      <Modal
        title="Up Load ไฟล์"
        open={modalShow}
        onCancel={hideModalUpFile}
        footer={null}
      >
        <UpFileJob
          onHide={hideModalUpFile}
          setDataJob={setDataJob}
          typeJob={typeJob}
        />
      </Modal>

      {contextHolder}
      <Card
        title="ปพ.5"
        hoverable
        styles={{
          body: { padding: 25, overflow: "hidden" },
          header: { padding: 25, backgroundColor: "#f8df8b" },
        }}
      >
        <TeacherPP5 />
      </Card>
    </>
  );
};

export default JobToSend;

//---------------- TeacherPP5 Component ----------------
const TeacherPP5 = () => {
  const contextObj = useContext(LoginContext);
  const [inputShow, setInputShow] = useState(false);
  const [dataTmpPp5, setDataTmpPp5] = useState([]);
  const [dataMyPp5, setDataMyPp5] = useState([]);
  const [dataAllPp5, setDataAllPp5] = useState([]);
  const [teacherList, setTeacherList] = useState([]);
  const [stdClass, setStdClass] = useState([]);

  useEffect(() => {
    serveFns
      .getConst("templatepp5")
      .then((data) => {
        setDataTmpPp5(JSON.parse(data));
        //isSpin(false);
      })
      .catch((error) => {
        console.log(error);
      });
    serveFns
      .getTeacher()
      .then((data) => {
        serveFns
          .getConst("stdclass")
          .then((data2) => {
            setTeacherList(JSON.parse(data));
            console.log(`Teacher List is ${data}`);
            setStdClass(JSON.parse(data2));
            console.log(`StdClass is ${data2}`);
            serveFns
              .getSheetDataPP5()
              .then((dataGetPP5) => {
                setDataAllPp5(JSON.parse(dataGetPP5).reverse());
                setDataMyPp5(
                  JSON.parse(dataGetPP5)
                    .filter((item) => item.user === contextObj.dataLogin.user)
                    .reverse(),
                );
                console.log(`Data My PP5 is ${dataGetPP5}`);
              })
              .catch((error) => {
                console.log(error);
              });
          })
          .catch((error) => {
            console.log(error);
          });

        console.log(`Teacher List is ${JSON.parse(data)}`);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  //---------------- MyPP5 Component ----------------
  const MyPP5 = () => {
    const delPP5 = (fileid) => {
      const dataPP5 = {
        user: contextObj.dataLogin.user,
        fileid: fileid,
      };
      message.loading({
        content: "กำลังลบ ปพ.5 โปรดรอสักครู่...",
        key: "delPP5",
      });
      serveFns
        .delPP5(dataPP5)
        .then((data) => {
          setDataAllPp5(JSON.parse(data).reverse());
          setDataMyPp5(
            JSON.parse(data)
              .filter((item) => item.user === contextObj.dataLogin.user)
              .reverse(),
          );
          console.log(`Data My PP5 is ${JSON.parse(data)}`);
          message.success("ลบ ปพ.5 เรียบร้อยแล้ว");
        })
        .catch((error) => {
          console.log(error);
          message.error("เกิดข้อผิดพลาดในการลบ ปพ.5");
        });
    };

    return (
      <>
        <List
          header={<div>ปพ.5 ของฉัน</div>}
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 4,
            lg: 4,
            xl: 6,
            xxl: 3,
          }}
          itemLayout="horizontal"
          dataSource={dataTmpPp5}
          renderItem={(item) => (
            <List.Item>
              <Tooltip title={`Template ปพ.5 ${item.class}`}>
                <Card
                  hoverable
                  styles={{
                    body: { padding: 25, overflow: "hidden" },
                    header: { padding: 25, backgroundColor: "#65a9f3" },
                  }}
                  title={`Template ปพ.5 ${item.class}`}
                >
                  <Button
                    type="primary"
                    onClick={() => {
                      window.open(item.fileurl, "_blank");
                      console.log(item.fileurl);
                    }}
                  >
                    <FileOutlined /> {item.class}
                  </Button>
                </Card>
              </Tooltip>
            </List.Item>
          )}
        />
        <br />
        <Button
          type="primary"
          onClick={() => {
            setInputShow(true);
          }}
        >
          <FileOutlined /> ส่ง Link ปพ.5
        </Button>
        <br />
        <Modal
          title="ส่ง Link ปพ.5"
          open={inputShow}
          onCancel={() => {
            setInputShow(false);
          }}
          footer={null}
        >
          <SendPP5
            setInputShow={setInputShow}
            setDataMyPp5={setDataMyPp5}
            setDataAllPp5={setDataAllPp5}
            stdClass={stdClass}
          />
        </Modal>

        <br />
        <List
          header={<div>รายการส่ง ปพ.5</div>}
          itemLayout="horizontal"
          dataSource={dataMyPp5}
          renderItem={(item) => (
            <List.Item>
              <span style={{ fontWeight: "bold" }}>
                ชั้น {item.class} - วิชา {item.subject} - {item.memo}
              </span>
              <Space.Compact>
                <Tooltip title="เปิด Sheet ปพ.5">
                  <Button
                    type="primary"
                    onClick={() => {
                      window.open(item.fileurl, "_blank");
                      console.log(item.fileurl);
                    }}
                  >
                    <FileOutlined />
                  </Button>
                </Tooltip>
                <Tooltip title="ลบ Sheet ปพ.5">
                  <Button
                    variant="solid"
                    color="danger"
                    onClick={() => {
                      Modal.confirm({
                        title: `ยืนยันลบ ปพ.5 `,
                        icon: <DeleteOutlined />,
                        content: `คุณต้องการลบ ปพ.5 วิชา ${item.subject} ของชั้น ${item.class} หรือไม่?`,
                        okText: "ยืนยัน",
                        cancelText: "ยกเลิก",
                        onOk() {
                          delPP5(item.fileid);
                        },
                        onCancel() {
                          console.log("ยกเลิกให้ปรับปรุงงาน");
                        },
                      });
                    }}
                  >
                    <DeleteOutlined />
                  </Button>
                </Tooltip>
              </Space.Compact>
            </List.Item>
          )}
        />
      </>
    );
  };
  //---------------- AllPP5 Component ----------------
  // This component displays all PP5 data in a list format

  const AllPP5 = () => {
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
        record[dataIndex]
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase()),
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
      {
        title: "ครู",

        key: "user",
        render: (_, record) => {
          return (
            <p>
              {teacherList.find((teacher) => teacher.user === record.user).name}
            </p>
          );
        },
        filters: teacherList.map((teacher) => ({
          text: teacher.name,
          value: teacher.user,
        })),
        onFilter: (value, record) => record.user.includes(value),
      },
      {
        title: "ชั้นเรียน",
        key: "class",
        dataIndex: "class",
        filters: stdClass.map((val) => ({
          text: val.classroom,
          value: val.classroom,
        })),
        onFilter: (value, record) => record.class.includes(value),
      },
      Object.assign(
        {
          title: "รายวิชา",
          dataIndex: "subject",
          key: "subject",
        },
        getColumnSearchProps("subject", "รายวิชา"),
      ),
      Object.assign(
        {
          title: "รายละเอียด",
          dataIndex: "memo",
          key: "memo",
        },
        getColumnSearchProps("memo", "รายละเอียด"),
      ),
      {
        title: "ปพ.5",

        key: "fileurl",
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
            </Space.Compact>
          </>
        ),
      },
    ];
    return (
      <>
        <Table dataSource={dataAllPp5} columns={columns} />
      </>
    );
  };

  return (
    <>
      <Collapse
        accordion
        defaultActiveKey={["1"]}
        items={[
          {
            key: "1",
            label: "ส่ง ปพ.5",
            children: <MyPP5 />,
          },
          {
            key: "2",
            label: "รายการ ปพ.5 ที่ส่งทั้งหมด ",
            children: <AllPP5 />,
          },
        ]}
        style={{ marginBottom: 20 }}
      />
    </>
  );
};
//---------------- SendPP5 Component ----------------
// This component is used to send PP5 data with a form input
// It includes fields for class, subject, memo, and file URL
// It uses Ant Design's Form, Select, and Input components for the UI
const SendPP5 = ({ setInputShow, setDataMyPp5, setDataAllPp5, stdClass }) => {
  const contextObj = useContext(LoginContext);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);

  /* const isSpin = (e) => {
    setOnSpin(e);
  }; */

  const handleSubmit = () => {
    setUploading(true);
    const pp5Data = {
      user: contextObj.dataLogin.user,
      stdclass: form.getFieldValue("class"),
      subject: form.getFieldValue("subject"),
      memo: form.getFieldValue("memo"),
      fileurl: form.getFieldValue("fileurl"),
    };
    console.log(`PP5 Data is ${JSON.stringify(pp5Data)}`);
    // Call the server function to put PP5 data
    serveFns
      .putPP5(pp5Data)
      .then((data) => {
        setDataAllPp5(JSON.parse(data).reverse());
        setDataMyPp5(
          JSON.parse(data)
            .filter((item) => item.user === contextObj.dataLogin.user)
            .reverse(),
        );
        message.success("ส่งข้อมูล ปพ.5 เรียบร้อยแล้ว");
        setInputShow(false);
        form.resetFields();
        setUploading(false);
        console.log(`Data My PP5 is ${data}`);
      })
      .catch((error) => {
        console.log(error);
        message.error(
          "เกิดข้อผิดพลาดในการส่งข้อมูล โปรดตรวจสอบ Link Sheet_ปพ.5 ถูกต้องหรือไม่ หรือเป็นเทมเพลตที่ไม่ยังไม่ทำสำเนา",
        );
        setUploading(false);
      });
  };

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };

  return (
    <>
      <Form
        form={form}
        {...layout}
        layout="vertical"
        name="control-upload"
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          label="ชั้นเรียน"
          name="class"
          rules={[{ required: true, message: "โปรดกรอกข้อมูลส่วนนี้ก่อน!" }]}
        >
          <Select
            placeholder="ชั้นเรียน"
            options={stdClass.map((val) => ({
              label: val.classroom,
              value: val.classroom,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="subject"
          label="รหัสวิชา ชื่อวิชา ฯ"
          rules={[{ required: true, message: "โปรดกรอกข้อมูลส่วนนี้ก่อน!" }]}
        >
          <Input placeholder="รหัสวิชา ชื่อวิชา ฯ" />
        </Form.Item>
        <Form.Item
          name="memo"
          label="บันทึกเพิ่มเติม"
          //rules={[{ required: true, message: "โปรดกรอกข้อมูลส่วนนี้ก่อน!" }]}
        >
          <Input placeholder="บันทึกเพิ่มเติม" />
        </Form.Item>
        <Form.Item
          name="fileurl"
          label="Link ไฟล์ ปพ.5"
          rules={[{ required: true, message: "โปรดกรอกข้อมูลส่วนนี้ก่อน!" }]}
        >
          <Input placeholder="Link ไฟล์ ปพ.5" />
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Button
            type="primary"
            htmlType="submit"
            loading={uploading}
            style={{ marginTop: 16 }}
          >
            บันทึก
          </Button>{" "}
          <Button htmlType="button" onClick={() => setInputShow(false)}>
            ยกเลิก
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

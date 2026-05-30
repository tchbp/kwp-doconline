import LoginContext from "@/LoginProvider";
import { useState, useEffect, useContext, useRef } from "react";
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
  Alert,
} from "antd";
// import Marquee from "react-fast-marquee";
import {
  FileOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CommentOutlined,
  WarningOutlined,
  FormOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import * as serveFns from "@/server/gas";
import Highlighter from "react-highlight-words";
import Spin2Wait from "@/components/Spin2Wait";
import CommentJob from "@/components/inhome/CommentJob";

const Inspect = () => {
  const contextObj = useContext(LoginContext);
  const [teacherList, setTeacherList] = useState([]);
  const [jobData, setJobData] = useState([]);
  const [jobList, setJobList] = useState([]);
  // **************************** constant to comment ********************
  const user2comm = contextObj.dataLogin.user;
  const pos = () => {
    const [level] = contextObj.dataLogin.level;
    console.log(`level is ${level}`);
    if (level === "1") {
      return 1;
    } else {
      return 2;
    }
  };

  const handleCommentClick = (fileid, comm, commD, memo) => {
    const modal = Modal.info({
      title: "ความคิดเห็นของผู้ตรวจ/ผู้อำนวยการ",
      icon: <CommentOutlined />,
      content: (
        <CommentJob
          pos={pos()}
          user={user2comm}
          comm={comm}
          commD={commD}
          fileid={fileid}
          memo={memo}
          onClose={(fileid = "", comm = "", commD = "") => {
            modal.destroy();
            updateJobData(fileid, comm, commD);
          }} // ปิด modal
        />
      ),
      footer: null, // ซ่อน footer ถ้าไม่ต้องการ
    });
  };
  const updateJobData = (fileid, comm, commD) => {
    console.log(
      `Updating job data for fileid: ${fileid} with comm: ${comm} and commD: ${commD}`,
    );
    if (!fileid) return; // ถ้าไม่มี fileid ให้หยุดการทำงาน
    setJobData((prevJobData) =>
      prevJobData.map((job) =>
        job.fileid === fileid
          ? { ...job, comment: comm, commentD: commD }
          : job,
      ),
    );
  };

  //******************* end constant to comment ********************
  const [onSpin, setOnSpin] = useState(false);
  const isSpin = (e) => {
    setOnSpin(e);
  };

  useEffect(() => {
    isSpin(true);
    const dataJob = {
      user: contextObj.dataLogin.user,
      level: contextObj.dataLogin.level,
    };
    serveFns
      .getTeacher()
      .then((data) => {
        serveFns
          .getJob2Inspect(dataJob)
          .then((data2) => {
            //-- setTeacherList
            setTeacherList(JSON.parse(data));
            console.log(JSON.parse(data));
            //-- setJobData and jobList
            const obj = JSON.parse(data2);
            setJobData(obj.jobData);
            setJobList(obj.jobList);
            console.log(obj);
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
  const inspectJob = (fileid, inspect) => {
    const data = {
      fileid: fileid,
      user: contextObj.dataLogin.user,
      level: contextObj.dataLogin.level,
      inspect: inspect,
    };
    isSpin(true);
    serveFns
      .inspectJob(data)
      .then((data) => {
        const obj = JSON.parse(data);
        setJobData(obj.jobData);
        setJobList(obj.jobList);
        isSpin(false);
        message.success("ตรวจงานสำเร็จ");
      })
      .catch((error) => {
        console.error(error);
        message.error("เกิดข้อผิดพลาดในการตรวจงาน");
      });
  };
  const columns = [
    {
      title: "ครู",

      key: "user",
      width: 150,
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
      title: "ประเภทงาน",
      dataIndex: "typeJob",
      key: "typeJob",
      width: 140,
      filters: jobList.map((job) => ({
        text: job.job,
        value: job.job,
      })),
      onFilter: (value, record) => record.typeJob.includes(value),
    },

    Object.assign(
      {
        title: "รายละเอียด",
        dataIndex: "memo",
        key: "memo",
        width: 280,
        render: (text) => (
          <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
            {text}
          </div>
        ),
      },
      getColumnSearchProps("memo", "รายละเอียด"),
    ),
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      width: 140,
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
    {
      title: "ไฟล์",

      key: "fileid",
      width: 80,
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
    {
      title: "ตรวจงาน",
      key: "inspect",
      width: 180,
      render: (_, record) => (
        <>
          <Alert
            title="ส่งเรียบร้อย"
            type="success"
            showIcon
            style={{
              width: "100%",
              display: record.status === "ส่งเรียบร้อย" ? "block" : "none",
            }}
          />
          {record.status !== "ส่งเรียบร้อย" && (
            <Space.Compact block>
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
              <Tooltip title="ตรวจผ่าน">
                <Button
                  variant="solid"
                  color="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => {
                    Modal.confirm({
                      title: "ยืนยันการตรวจงาน",
                      icon: <CheckCircleOutlined />,
                      content: `คุณต้องการตรวจงาน ${record.typeJob} ของ ${
                        teacherList.find(
                          (teacher) => teacher.user === record.user,
                        ).name
                      } หรือไม่?`,
                      okText: "ยืนยัน",
                      cancelText: "ยกเลิก",
                      onOk() {
                        inspectJob(record.fileid, "ตรวจผ่าน");
                      },
                      onCancel() {
                        console.log("ยกเลิกการตรวจงาน");
                      },
                    });
                  }}
                />
              </Tooltip>

              <Tooltip title="ปรับปรุง">
                <Button
                  variant="solid"
                  color="danger"
                  icon={<WarningOutlined />}
                  onClick={() => {
                    Modal.confirm({
                      title: "ยืนยันให้ปรับปรุงงาน",
                      icon: <WarningOutlined />,
                      content: `คุณต้องการให้ครู ${
                        teacherList.find(
                          (teacher) => teacher.user === record.user,
                        ).name
                      } ปรับปรุงงาน ${record.typeJob} หรือไม่?`,
                      okText: "ยืนยัน",
                      cancelText: "ยกเลิก",
                      onOk() {
                        inspectJob(record.fileid, "ปรับปรุง");
                      },
                      onCancel() {
                        FormOutlined;
                        console.log("ยกเลิกให้ปรับปรุงงาน");
                      },
                    });
                  }}
                />
              </Tooltip>
            </Space.Compact>
          )}
        </>
      ),
    },
  ];
  return (
    <>
      <Card
        title="ตรวจงาน"
        hoverable
        styles={{
          body: { padding: 25, overflow: "auto", width: "100%" },
          header: { padding: 25, backgroundColor: "#d3f261" },
        }}
      >
        {/* <Card
          hoverable
          style={{ width: 240 }}
          cover={
            <img
              alt="กำลังพัฒนา"
              src="https://drive.google.com/thumbnail?id=1hHlqJsc3fC-EN_ooS56KkwypTmWh1N4t"
            />
          }
        >
          <Meta title="กำลังพัฒนา" />
        </Card> */}
        <Space orientation="vertical" size="middle" style={{ display: "flex" }}>
          {jobData.length > 0 && (
            <Table
              dataSource={jobData}
              columns={columns}
              style={{ width: "100%" }}
              scroll={{ x: 970 }}
              size="small"
              tableLayout="fixed"
              pagination={{ pageSize: 10 }}
            />
          )}
          {jobData.length === 0 && (
            <Alert
              title="ไม่มีงานที่ได้รับมอบหมายที่ต้องตรวจ"
              type="info"
              showIcon
              style={{ width: "100%" }}
            />
          )}
          <Spin2Wait onSpin={onSpin} message={"กำลังดึงข้อมูลโปรดรอซักครู่"} />
        </Space>
      </Card>
    </>
  );
};

export default Inspect;

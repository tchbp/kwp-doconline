import { Tabs } from "antd";
import {
  ScheduleOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined,
  ReconciliationOutlined,
} from "@ant-design/icons";
import RepBooks from "@/components/saraban/RepBooks";
// import SendBooks from "@/components/saraban/SendBooks";
// import CmdBooks from "@/components/saraban/CmdBooks";
// import AnnoBooks from "@/components/saraban/AnnoBooks";

const onChange = (key) => {
  console.log(key);
};
const items = [
  {
    key: "0",
    label: "หนังสือรับ",
    icon: <ReconciliationOutlined />,
    children: <RepBooks bookType={0} />,
  },
  {
    key: "1",
    label: "หนังสือส่ง",
    icon: <ReconciliationOutlined />,
    children: <RepBooks bookType={1} />,
  },
  {
    key: "2",
    label: "บันทึกข้อความ",
    icon: <ReconciliationOutlined />,
    children: <RepBooks bookType={2} />,
  },
  {
    key: "3",
    label: "คำสั่ง",
    icon: <ReconciliationOutlined />,
    children: <RepBooks bookType={3} />,
  },
  {
    key: "4",
    label: "ประกาศ",
    icon: <ReconciliationOutlined />,
    children: <RepBooks bookType={4} />,
  },
];

const TabsSaraban = () => {
  return (
    <Tabs
      defaultActiveKey="0"
      items={items}
      onChange={onChange}
      destroyOnHidden={true}
    />
  );
};

export default TabsSaraban;

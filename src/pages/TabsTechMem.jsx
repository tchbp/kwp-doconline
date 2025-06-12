import { Tabs } from "antd";
import {
  ScheduleOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import TechMem from "./TechMem";
import ViewTMem from "./ViewTMem";
import ViewStdAbs from "./ViewStdAbs";
import ViewMyTeach from "./ViewMyTeach";

const onChange = (key) => {
  console.log(key);
};
const items = [
  {
    key: "1",
    label: "บันทึกเข้าสอน",
    icon: <ScheduleOutlined />,
    children: <TechMem />,
  },
  {
    key: "2",
    label: "ดูบันทึกเข้าสอน",
    icon: <SolutionOutlined />,
    children: <ViewTMem />,
  },
  {
    key: "3",
    label: "ดูบันทึกเข้าชั้นเรียน",
    icon: <TeamOutlined />,
    children: <ViewStdAbs />,
  },
  {
    key: "4",
    label: "ดูบันทึกของฉัน",
    icon: <UserOutlined />,
    children: <ViewMyTeach />,
  },
];

const TabsTechMem = () => {
  return (
    <Tabs
      defaultActiveKey="1"
      items={items}
      onChange={onChange}
      destroyInactiveTabPane={true}
    />
  );
};

export default TabsTechMem;

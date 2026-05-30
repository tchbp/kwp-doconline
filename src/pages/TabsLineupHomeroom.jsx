import { Tabs } from "antd";
import {
  ScheduleOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import LineupHomeroom from "./LineupHomeroom";
import ViewHomeroom from "./ViewHomeroom";
import ViewStdHomeroom from "./ViewStdHomeroom";
import ViewMyLuHr from "./ViewMyLuHr";

const onChange = (key) => {
  console.log(key);
};
const items = [
  {
    key: "1",
    label: "บันทึกเข้าแถว/โฮมรูม",
    icon: <ScheduleOutlined />,
    children: <LineupHomeroom />,
  },
  {
    key: "2",
    label: "ดูบันทึกเข้าแถว/โฮมรูม",
    icon: <SolutionOutlined />,
    children: <ViewHomeroom />,
  },
  {
    key: "3",
    label: "ดูบันทึกเข้าแถว/โฮมรูม ชั้นเรียน",
    icon: <TeamOutlined />,
    children: <ViewStdHomeroom />,
  },
  {
    key: "4",
    label: "ดูบันทึกของฉัน",
    icon: <UserOutlined />,
    children: <ViewMyLuHr />,
  },
];

const TabsLineupHomeroom = () => {
  return (
    <Tabs
      defaultActiveKey="1"
      items={items}
      onChange={onChange}
      destroyOnHidden={true}
    />
  );
};

export default TabsLineupHomeroom;

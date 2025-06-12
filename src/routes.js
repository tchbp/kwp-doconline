import TabsLineupHomeroom from "./pages/TabsLineupHomeroom";
import TabsTechMem from "./pages/TabsTechMem";
import ListDocument from "./pages/ListDocument";
//import Student from "./pages/Student";
//import Profile from "./pages/Profile";
//import Contact from "./pages/Contact";
//import Tasks from "./pages/Tasks";
//import Settings from "./pages/Settings";
import Home from "./pages/Home";

export const routes = [
  {
    title: "Home",
    url: "/",
    component: Home,
  },
  /*{
    title: "Tasks",
    url: "/Tasks",
    component: Tasks,
  },
  {
    title: "Settings",
    url: "/settings",
    component: Settings,
  },
  {
    title: "Contact",
    url: "/contact",
    component: Contact,
  },

  {
    title: "Profile",
    url: "/profile",
    component: Profile,
  },*/
  // {
  //   title: "Student",
  //   url: "/student",
  //   component: Student,
  // },
  {
    title: "ไฟล์คำสั่ง",
    url: "/listdocument",
    component: ListDocument,
  },
  {
    title: "บันทึกการสอน",
    url: "/techmem",
    component: TabsTechMem,
  },
  {
    title: "บันทึกเข้าแถว/โฮมรูม",
    url: "/lineuphomeroom",
    component: TabsLineupHomeroom,
  },
];

//import DocNewList from "@/components/inhome/dashboard/DocNewList";
import KadTop10 from "@/components/inhome/dashboard/KadTop10";
import MemNewList from "@/components/inhome/dashboard/MemNewList";
import RepBooksNew from "./dashboard/RepBooksNew";

const DashBoard = () => {
  return (
    <>
      <KadTop10 />
      <RepBooksNew typeBook={0} />
      <RepBooksNew typeBook={3} />
      <MemNewList />
    </>
  );
};

export default DashBoard;

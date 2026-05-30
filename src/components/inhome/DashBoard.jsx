import DocNewList from "@/components/inhome/dashboard/DocNewList";
import MemNewList from "@/components/inhome/dashboard/MemNewList";
import RepBooksNew from "./dashboard/RepBooksNew";

const DashBoard = () => {
  return (
    <>
      <RepBooksNew typeBook={0} />
      <DocNewList />
      <MemNewList />
    </>
  );
};

export default DashBoard;

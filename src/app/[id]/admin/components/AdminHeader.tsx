import { Space } from "antd";
import DeleteClassButton from "@/app/[id]/admin/components/DeleteClassButton";
import DeleteScheduleButton from "@/app/[id]/admin/components/DeleteScheduleButton";

interface AdminHeaderProps {
  profileName: string;
  teacherId: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  profileName,
  teacherId,
}) => {
  return (
    <header className="bg-white shadow rounded-lg p-4 md:p-6 mb-4 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <h1 className="text-lg md:text-2xl lg:text-3xl font-bold">
          {decodeURI(profileName)} 선생님의 시간표
        </h1>
      </div>
      <Space className="mt-4 md:mt-0">
        <DeleteScheduleButton teacherId={teacherId} />

        <DeleteClassButton teacherId={teacherId} />
      </Space>
    </header>
  );
};

export default AdminHeader;

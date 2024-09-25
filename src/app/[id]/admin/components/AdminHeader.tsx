import { Space, Button } from "antd";
import { useState } from "react";
import DeleteClassButton from "@/app/[id]/admin/components/DeleteClassButton";
import DeleteScheduleButton from "@/app/[id]/admin/components/DeleteScheduleButton";
import EditTimeLimitModal from "@/app/[id]/admin/components/EditTimeLimitModal";
import ViewAndEditLimitsModal from "@/app/[id]/admin/components/ViewAndEditLimitsModal";

interface AdminHeaderProps {
  profileName: string;
  teacherId: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  profileName,
  teacherId,
}) => {
  const [isEditTimeLimitModalVisible, setIsEditTimeLimitModalVisible] =
    useState(false);
  const [isViewAndEditLimitsModalVisible, setIsViewAndEditLimitsModalVisible] =
    useState(false);

  return (
    <header className="bg-white shadow rounded-lg p-4 md:p-6 mb-4 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <h1 className="text-lg md:text-2xl lg:text-3xl font-bold">
          {decodeURI(profileName)} 선생님의 시간표
        </h1>
      </div>
      <Space className="mt-4 md:mt-0">
        <Button onClick={() => setIsEditTimeLimitModalVisible(true)}>
          시간별 인원 제한 설정
        </Button>
        <Button onClick={() => setIsViewAndEditLimitsModalVisible(true)}>
          인원 제한 수정
        </Button>
        <DeleteScheduleButton teacherId={teacherId} />
        <DeleteClassButton teacherId={teacherId} />
      </Space>
      <EditTimeLimitModal
        visible={isEditTimeLimitModalVisible}
        onClose={() => setIsEditTimeLimitModalVisible(false)}
        profileId={teacherId}
      />
      <ViewAndEditLimitsModal
        visible={isViewAndEditLimitsModalVisible}
        onClose={() => setIsViewAndEditLimitsModalVisible(false)}
        profileId={teacherId}
      />
    </header>
  );
};

export default AdminHeader;

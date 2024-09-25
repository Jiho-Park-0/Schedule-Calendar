import { Button } from "antd";
import React, { useState } from "react";
import ScheduleLimitModal from "./ScheduleLimitModal";

interface HeaderProps {
  profileName: string;
  teacherId: string;
  onTeacherActionClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
  profileName,
  teacherId,
  onTeacherActionClick,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleClose = () => {
    setIsModalVisible(false);
  };

  return (
    <header className="bg-white shadow rounded-lg p-4 md:p-6 mb-4 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <h1 className="text-lg md:text-2xl lg:text-3xl font-bold">
          {decodeURI(profileName)} 선생님의 시간표
        </h1>
      </div>
      <div>
        <Button onClick={onTeacherActionClick}>관리자 페이지</Button>
        <Button onClick={showModal} style={{ marginLeft: "10px" }}>
          수강 제한 보기
        </Button>
      </div>
      <ScheduleLimitModal
        teacherId={teacherId}
        visible={isModalVisible}
        onClose={handleClose}
      />
    </header>
  );
};

export default Header;

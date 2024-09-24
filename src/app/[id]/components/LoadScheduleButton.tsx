"use client";

import { Button } from "antd";
import { useState } from "react";
import TeacherActionModal from "./TeacherActionModal";

interface LoadScheduleButtonProps {
  teacherId: string;
  currentWeekString: string;
}

export default function LoadScheduleButton({
  teacherId,
}: LoadScheduleButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button onClick={handleOpenModal}>시간표 불러오기</Button>
      <TeacherActionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        teacherId={teacherId}
      />
    </>
  );
}

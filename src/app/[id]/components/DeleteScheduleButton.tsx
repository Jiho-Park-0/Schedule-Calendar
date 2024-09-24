"use client";

import { Button } from "antd";
import { useState } from "react";
import TeacherActionModal from "./TeacherActionModal";

interface DeleteScheduleButtonProps {
  teacherId: string;
}

export default function DeleteScheduleButton({
  teacherId,
}: DeleteScheduleButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button onClick={handleOpenModal}>시간표 삭제</Button>
      <TeacherActionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        teacherId={teacherId}
      />
    </>
  );
}

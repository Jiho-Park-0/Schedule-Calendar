"use client";

import { useState } from "react";
import { Button } from "antd";
import TeacherActionModal from "@/app/[id]/components/TeacherActionModal";

interface DeleteClassButtonProps {
  teacherId: string;
}

export default function DeleteClassButton({
  teacherId,
}: DeleteClassButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button danger onClick={handleOpenModal}>
        반 삭제
      </Button>
      <TeacherActionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        actionType="deleteClass"
        teacherId={teacherId} // Pass the teacherId to the modal
      />
    </>
  );
}

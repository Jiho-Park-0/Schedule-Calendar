"use client";

import { Button, Modal, Select, message } from "antd";
import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { scheduleCalendarFirestore } from "@/firebase";

interface DeleteScheduleButtonProps {
  teacherId: string;
}

export default function DeleteScheduleButton({
  teacherId,
}: DeleteScheduleButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentNames, setStudentNames] = useState<string[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentNames = async () => {
      try {
        const q = query(
          collection(scheduleCalendarFirestore, `profiles/${teacherId}/student`)
        );
        const querySnapshot = await getDocs(q);
        const names = querySnapshot.docs.map((doc) => doc.data().name);
        const uniqueNames = Array.from(new Set(names));
        setStudentNames(uniqueNames);
      } catch (error) {
        console.error("Failed to fetch student names:", error);
      }
    };

    fetchStudentNames();
  }, [teacherId]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  const handleDeleteSchedules = async () => {
    if (!selectedStudent) {
      message.error("학생을 선택해주세요.");
      return;
    }

    try {
      const q = query(
        collection(scheduleCalendarFirestore, `profiles/${teacherId}/student`),
        where("name", "==", selectedStudent)
      );
      const querySnapshot = await getDocs(q);

      const deletePromises = querySnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);

      message.success("학생의 모든 스케줄이 삭제되었습니다.");
      setStudentNames((prevNames) =>
        prevNames.filter((name) => name !== selectedStudent)
      );
      handleCloseModal();
    } catch (error) {
      message.error("스케줄 삭제에 실패했습니다.");
      console.error("Failed to delete schedules:", error);
    }
  };

  return (
    <>
      <Button onClick={handleOpenModal}>학생 스케줄 삭제</Button>
      <Modal
        title="학생 스케줄 삭제"
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={handleDeleteSchedules}
      >
        <Select
          placeholder="학생을 선택해주세요"
          className="w-full"
          value={selectedStudent}
          onChange={(value) => setSelectedStudent(value)}
        >
          {studentNames.map((name, index) => (
            <Select.Option key={`${name}-${index}`} value={name}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Modal>
    </>
  );
}

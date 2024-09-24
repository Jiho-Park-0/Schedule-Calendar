import { Modal, Input, Select, message, Radio } from "antd";
import TimePicker from "./TimePicker";
import { useState, useEffect } from "react";

import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { scheduleCalendarFirestore } from "@/firebase";

interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSchedule: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    day: string;
  } | null;
  teacherId: string;
}

const EditClassModal: React.FC<EditClassModalProps> = ({
  isOpen,
  onClose,
  selectedSchedule,
  teacherId,
}) => {
  const [name, setName] = useState<string>("");
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [action, setAction] = useState<"edit" | "delete">("edit");

  useEffect(() => {
    if (selectedSchedule) {
      setName(selectedSchedule.name);
      setStartTime(selectedSchedule.startTime);
      setEndTime(selectedSchedule.endTime);
      setDay(selectedSchedule.day);
    }
  }, [selectedSchedule]);

  useEffect(() => {
    if (isOpen) {
      setAction("edit");
    }
  }, [isOpen]);

  const handleTimeSelection = (time: string) => {
    if (!startTime || (startTime && endTime)) {
      setStartTime(time);
      setEndTime(null);
    } else if (time > startTime) {
      setEndTime(time);
    } else {
      setStartTime(time);
      setEndTime(null);
    }
  };

  const handleDelete = async () => {
    if (selectedSchedule) {
      try {
        const docRef = doc(
          scheduleCalendarFirestore,
          `profiles/${teacherId}/student`,
          selectedSchedule.id // Use the unique ID
        );

        await deleteDoc(docRef);

        message.success("수업이 삭제되었습니다.");
        onClose();
      } catch (error) {
        message.error("수업 삭제에 실패했습니다.");
        console.error("Failed to delete class:", error);
      }
    } else {
      message.error("수업 정보를 찾을 수 없습니다.");
    }
  };

  const handleSave = async () => {
    if (action === "delete") {
      handleDelete();
    } else {
      if (selectedSchedule) {
        try {
          const docRef = doc(
            scheduleCalendarFirestore,
            `profiles/${teacherId}/student`,
            selectedSchedule.id // Use the unique ID
          );

          await updateDoc(docRef, {
            name,
            startTime,
            endTime,
            day,
          });

          message.success("수업이 수정되었습니다.");
          onClose();
        } catch (error) {
          message.error("수업 수정에 실패했습니다.");
          console.error("Failed to update class:", error);
        }
      }
    }
  };

  return (
    <Modal title="수업 수정" open={isOpen} onCancel={onClose} onOk={handleSave}>
      <div className="py-4 space-y-4">
        <>
          <div>
            <label htmlFor="edit-student-name">이름</label>
            <Input
              id="edit-student-name"
              className="mt-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="edit-class-day">요일</label>
            <Select
              id="edit-class-day"
              className="mt-2 w-full"
              value={day}
              onChange={(value) => setDay(value)}
            >
              <Select.Option value="일">일</Select.Option>
              <Select.Option value="월">월</Select.Option>
              <Select.Option value="화">화</Select.Option>
              <Select.Option value="수">수</Select.Option>
              <Select.Option value="목">목</Select.Option>
              <Select.Option value="금">금</Select.Option>
              <Select.Option value="토">토</Select.Option>
            </Select>
          </div>
          <TimePicker
            startTime={startTime}
            endTime={endTime}
            onTimeSelect={handleTimeSelection}
          />
          <Radio.Group
            onChange={(e) => setAction(e.target.value)}
            value={action}
            className="mb-4"
          >
            <Radio value="edit">수정</Radio>
            <Radio value="delete">삭제</Radio>
          </Radio.Group>
        </>
      </div>
    </Modal>
  );
};

export default EditClassModal;

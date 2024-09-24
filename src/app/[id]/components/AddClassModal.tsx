import { Modal, Input, Select } from "antd";
import TimePicker from "./TimePicker";
import { useState, useEffect } from "react";
import { doc, setDoc } from "firebase/firestore";
import { scheduleCalendarFirestore } from "@/firebase";
import { v4 as uuidv4 } from "uuid";

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDay: string | null;
  teacherId: string;
}

const AddClassModal: React.FC<AddClassModalProps> = ({
  isOpen,
  onClose,
  selectedDay,
  teacherId,
}) => {
  const [name, setName] = useState<string>("");
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setStartTime(null);
      setEndTime(null);
      setDay(null);
    }
    if (isOpen && selectedDay) {
      setDay(selectedDay);
    }
  }, [isOpen, selectedDay]);

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

  const handleSave = async () => {
    if (name && startTime && endTime && day) {
      const collectionPath = `profiles/${teacherId}/student`;
      const uniqueId = uuidv4();
      const docRef = doc(scheduleCalendarFirestore, collectionPath, uniqueId);

      await setDoc(docRef, {
        name,
        startTime,
        endTime,
        day,
      });

      onClose();
    } else {
      console.error("All fields are required");
    }
  };

  return (
    <Modal title="수업 추가" open={isOpen} onCancel={onClose} onOk={handleSave}>
      <div className="py-4 space-y-4">
        <div>
          <label htmlFor="student-name">이름</label>
          <Input
            id="student-name"
            className="mt-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="class-day">요일</label>
          <Select
            id="class-day"
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
      </div>
    </Modal>
  );
};

export default AddClassModal;

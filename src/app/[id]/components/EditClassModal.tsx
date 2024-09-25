import { Modal, Input, Select, message, Radio } from "antd";
import TimePicker from "./TimePicker";
import { useState, useEffect } from "react";

import { doc, deleteDoc, updateDoc, getDoc } from "firebase/firestore";
import { scheduleCalendarFirestore } from "@/firebase";

const colorOptions = [
  "#1890ff",
  "#52c41a",
  "#faad14",
  "#f5222d",
  "#722ed1",
  "#13c2c2",
  "#eb2f96",
  "#fa8c16",
  "#a0d911",
  "#2f54eb",
  "#fadb14",
  "#eb4d4b",
];

interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSchedule: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    day: string;
    backgroundColor: string;
    password: string;
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
  const [backgroundColor, setBackgroundColor] = useState(colorOptions[0]);
  const [password, setPassword] = useState<string>("");
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [action, setAction] = useState<"edit" | "delete">("edit");
  const [adminPasswordFromDB, setAdminPasswordFromDB] = useState<string>("");

  // console.log(selectedSchedule);

  useEffect(() => {
    if (selectedSchedule) {
      setName(selectedSchedule.name);
      setStartTime(selectedSchedule.startTime);
      setEndTime(selectedSchedule.endTime);
      setDay(selectedSchedule.day);
      setBackgroundColor(selectedSchedule.backgroundColor);
      setPassword("");
      setAdminPassword("");
    }
  }, [selectedSchedule]);

  useEffect(() => {
    const fetchAdminPassword = async () => {
      try {
        const docRef = doc(scheduleCalendarFirestore, `profiles/${teacherId}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAdminPasswordFromDB(docSnap.data().password);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching admin password:", error);
      }
    };
    if (isOpen) {
      setAction("edit");
      fetchAdminPassword();
    }
  }, [isOpen, teacherId]);

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

  const isPasswordValid = () => {
    console.log(password, selectedSchedule?.password);
    console.log(adminPassword, adminPasswordFromDB);
    return (
      password === selectedSchedule?.password ||
      adminPassword === adminPasswordFromDB
    );
  };

  const handleDelete = async () => {
    if (!isPasswordValid()) {
      message.error("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (selectedSchedule) {
      try {
        const docRef = doc(
          scheduleCalendarFirestore,
          `profiles/${teacherId}/student`,
          selectedSchedule.id
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
    if (!isPasswordValid()) {
      message.error("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (action === "delete") {
      handleDelete();
    } else {
      if (selectedSchedule) {
        try {
          const docRef = doc(
            scheduleCalendarFirestore,
            `profiles/${teacherId}/student`,
            selectedSchedule.id
          );

          await updateDoc(docRef, {
            name,
            startTime,
            endTime,
            day,
            backgroundColor,
            password,
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
        <div>
          <span className="text-sm md:text-base lg:text-lg">스케줄 색상</span>
          <div className="grid grid-cols-6 gap-2 mt-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                className={`w-8 h-8 rounded-full border-2 ${
                  backgroundColor === color
                    ? "border-black"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setBackgroundColor(color)}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="student-password">비밀번호</label>
          <Input
            id="student-password"
            type="password"
            placeholder="비밀번호를 입력해주세요."
            className="mt-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {password &&
            !/^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password) && (
              <span className="text-red-500">
                비밀번호는 영문과 숫자를 포함하여 최소 8자 이상이어야 합니다.
              </span>
            )}
        </div>
        <div>
          <label htmlFor="admin-password">관리자 비밀번호</label>
          <Input
            id="admin-password"
            type="password"
            placeholder="관리자 비밀번호를 입력해주세요."
            className="mt-2"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
          />
        </div>
        <Radio.Group
          onChange={(e) => setAction(e.target.value)}
          value={action}
          className="mb-4"
        >
          <Radio value="edit">수정</Radio>
          <Radio value="delete">삭제</Radio>
        </Radio.Group>
      </div>
    </Modal>
  );
};

export default EditClassModal;

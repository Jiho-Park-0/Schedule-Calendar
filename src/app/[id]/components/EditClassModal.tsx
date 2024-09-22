import { Modal, Input, DatePicker, Radio, Space, message } from "antd";
import TimePicker from "./TimePicker";
import { useState, useEffect } from "react";
import moment from "moment";
import { doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { scheduleCalendarFirestore } from "@/firebase";

interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSchedule: {
    id: string; // Change id type to string to match uuid
    name: string;
    startTime: string;
    endTime: string;
    date: string;
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
  const [date, setDate] = useState<moment.Moment | null>(null);
  const [password, setPassword] = useState<string>("");
  const [action, setAction] = useState<"edit" | "delete">("edit");

  const getWeekOfMonth = (date: moment.Moment | null) => {
    if (!date) return "";
    const WEEK_KOR = ["1주차", "2주차", "3주차", "4주차", "5주차"];
    const weekDates = Array.from({ length: 7 }, (_, i) =>
      moment(date).startOf("week").add(i, "days")
    );

    const referenceDate = weekDates[4];
    const firstDate = new Date(referenceDate.year(), referenceDate.month(), 1);
    const firstDayOfWeek = firstDate.getDay();

    let firstSunday = 1 - firstDayOfWeek;
    if (firstSunday > 1) {
      firstSunday -= 7;
    }

    const weekNum = Math.ceil((referenceDate.date() - firstSunday) / 7);

    return WEEK_KOR[weekNum - 1];
  };

  useEffect(() => {
    const fetchSchedule = async () => {
      if (isOpen && selectedSchedule) {
        const scheduleDate = moment(selectedSchedule.date);
        const weekOfMonth = getWeekOfMonth(scheduleDate);
        const docRef = doc(
          scheduleCalendarFirestore,
          `profiles/${teacherId}/${
            scheduleDate.format("YYYY년 M월") + " " + weekOfMonth
          }`,
          selectedSchedule.id // Use the unique ID
        );
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name);
          setStartTime(data.startTime);
          setEndTime(data.endTime);
          setDate(moment(data.date));
        } else {
          message.error("해당 수업 정보를 찾을 수 없습니다.");
        }
      }
    };

    fetchSchedule();
  }, [isOpen, selectedSchedule, teacherId]);

  useEffect(() => {
    if (selectedSchedule) {
      setName(selectedSchedule.name);
      setStartTime(selectedSchedule.startTime);
      setEndTime(selectedSchedule.endTime);
      setDate(moment(selectedSchedule.date));
    }
  }, [selectedSchedule]);

  useEffect(() => {
    if (isOpen) {
      setAction("edit");
      setPassword("");
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
    if (selectedSchedule && password) {
      try {
        const scheduleDate = moment(selectedSchedule.date);
        const weekOfMonth = getWeekOfMonth(scheduleDate);
        const docRef = doc(
          scheduleCalendarFirestore,
          `profiles/${teacherId}/${
            scheduleDate.format("YYYY년 M월") + " " + weekOfMonth
          }`,
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
      message.error("비밀번호가 올바르지 않습니다.");
    }
  };

  const handleSave = async () => {
    if (action === "delete") {
      handleDelete();
    } else {
      if (selectedSchedule) {
        try {
          const scheduleDate = moment(selectedSchedule.date);
          const weekOfMonth = getWeekOfMonth(scheduleDate);
          const docRef = doc(
            scheduleCalendarFirestore,
            `profiles/${teacherId}/${
              scheduleDate.format("YYYY년 M월") + " " + weekOfMonth
            }`,
            selectedSchedule.id // Use the unique ID
          );

          await updateDoc(docRef, {
            name,
            startTime,
            endTime,
            date: date ? date.format("YYYY-MM-DD") : selectedSchedule.date,
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
          <label htmlFor="edit-class-date">날짜</label>
          <DatePicker
            id="edit-class-date"
            className="mt-2"
            value={date}
            onChange={(date) => setDate(date)}
          />
        </div>
        <TimePicker
          startTime={startTime}
          endTime={endTime}
          onTimeSelect={handleTimeSelection}
        />
        <Radio.Group value={action} onChange={(e) => setAction(e.target.value)}>
          <Space direction="vertical">
            <Radio value="edit">수정</Radio>
            <Radio value="delete">삭제</Radio>
          </Space>
        </Radio.Group>
        <div>
          <label htmlFor="edit-password">비밀번호 입력</label>
          <Input
            id="edit-password"
            type="password"
            className="mt-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
};

export default EditClassModal;

import { Modal, Input, DatePicker } from "antd";
import TimePicker from "./TimePicker";
import { useState, useEffect } from "react";
import moment from "moment";
import { doc, setDoc } from "firebase/firestore";
import { scheduleCalendarFirestore } from "@/firebase";

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: moment.Moment | null;
  teacherId: string;
}

const AddClassModal: React.FC<AddClassModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  teacherId,
}) => {
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [date, setDate] = useState<moment.Moment | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setPassword("");
      setStartTime(null);
      setEndTime(null);
      setDate(null);
    }
    if (isOpen && selectedDate) {
      setDate(selectedDate);
    }
  }, [isOpen, selectedDate]);

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
    if (name && password && startTime && endTime && date) {
      const weekOfMonth = getWeekOfMonth(date);
      const collectionPath = `profiles/${teacherId}/${date.format(
        "YYYY년 M월"
      )} ${weekOfMonth}`;
      const docRef = doc(
        scheduleCalendarFirestore,
        collectionPath,
        date.format("YYYY-MM-DD")
      );

      await setDoc(docRef, {
        name,
        password,
        startTime,
        endTime,
        date: date.format("YYYY-MM-DD"),
      });

      onClose();
      // window.location.reload(); // 새로고침 제거
    } else {
      // Handle validation error
      console.error("All fields are required");
    }
  };

  const getWeekOfMonth = (date: moment.Moment) => {
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
          <label htmlFor="class-date">날짜</label>
          <DatePicker
            id="class-date"
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
        <div>
          <label htmlFor="student-password">비밀번호 (4자리)</label>
          <Input
            id="student-password"
            type="password"
            maxLength={4}
            className="mt-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
};

export default AddClassModal;

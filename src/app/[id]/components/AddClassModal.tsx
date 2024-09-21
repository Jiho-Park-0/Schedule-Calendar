import { Modal, Input, DatePicker } from "antd";
import TimePicker from "./TimePicker";
import { useState, useEffect } from "react";
import moment from "moment";

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: moment.Moment | null;
}

const AddClassModal: React.FC<AddClassModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
}) => {
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [date, setDate] = useState<moment.Moment | null>(null);

  useEffect(() => {
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
  console.log(typeof date, date);
  return (
    <Modal
      title="수업 추가"
      open={isOpen}
      onCancel={onClose}
      onOk={() => {
        onClose();
        setStartTime(null);
        setEndTime(null);
        setDate(null);
      }}
    >
      <div className="py-4 space-y-4">
        <div>
          <label htmlFor="student-name">이름</label>
          <Input id="student-name" className="mt-2" />
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
          />
        </div>
      </div>
    </Modal>
  );
};

export default AddClassModal;

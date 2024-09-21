import { Modal, Input, DatePicker, Radio, Space } from "antd";
import TimePicker from "./TimePicker";
import { useState } from "react";
import moment from "moment";

interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditClassModal: React.FC<EditClassModalProps> = ({ isOpen, onClose }) => {
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);

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

  return (
    <Modal
      title="수업 수정"
      open={isOpen}
      onCancel={onClose}
      onOk={() => {
        onClose();
        setStartTime(null);
        setEndTime(null);
      }}
    >
      <div className="py-4 space-y-4">
        <div>
          <label htmlFor="edit-student-name">이름</label>
          <Input id="edit-student-name" className="mt-2" defaultValue="지혜" />
        </div>
        <div>
          <label htmlFor="edit-class-date">날짜</label>
          <DatePicker
            id="edit-class-date"
            className="mt-2"
            defaultValue={moment("2023-09-18")}
          />
        </div>
        <TimePicker
          startTime={startTime}
          endTime={endTime}
          onTimeSelect={handleTimeSelection}
        />
        <Radio.Group defaultValue="edit">
          <Space direction="vertical">
            <Radio value="edit">수정</Radio>
            <Radio value="delete">삭제</Radio>
          </Space>
        </Radio.Group>
        <div>
          <label htmlFor="edit-password">비밀번호 입력</label>
          <Input id="edit-password" type="password" className="mt-2" />
        </div>
      </div>
    </Modal>
  );
};

export default EditClassModal;

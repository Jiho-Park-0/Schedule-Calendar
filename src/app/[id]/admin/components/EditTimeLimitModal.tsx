import React, { useEffect, useState } from "react";
import { Modal, InputNumber, Form, Button, message, Select } from "antd";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { scheduleCalendarFirestore } from "@/firebase";
import TimePicker from "@/app/[id]/components/TimePicker";

interface EditTimeLimitModalProps {
  visible: boolean;
  onClose: () => void;
  profileId: string;
}

const EditTimeLimitModal: React.FC<EditTimeLimitModalProps> = ({
  visible,
  onClose,
  profileId,
}) => {
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [limitNum, setLimitNum] = useState<number | null>(0); // Default to 0
  const [day, setDay] = useState<string>("월");
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  useEffect(() => {
    if (visible) {
      const fetchLimits = async () => {
        const newLimits: { [key: string]: number } = {};
        const limitCollectionRef = collection(
          scheduleCalendarFirestore,
          "profiles",
          profileId,
          "limit"
        );
        const querySnapshot = await getDocs(limitCollectionRef);
        querySnapshot.forEach((doc) => {
          newLimits[doc.id] = doc.data().limitNum;
        });
      };

      fetchLimits();
    }
  }, [visible, profileId]);

  const handleSave = async () => {
    if (!startTime || !endTime) {
      message.error("시간을 선택하세요.");
      return;
    }

    const uniqueId = uuidv4();

    try {
      // 문서를 새로 추가하면서 id 필드를 함께 저장합니다.
      const docRef = doc(
        scheduleCalendarFirestore,
        "profiles",
        profileId,
        "limit",
        uniqueId
      );
      await setDoc(docRef, { startTime, endTime, limitNum, day }); // id를 명시적으로 저장
      message.success("인원 제한이 성공적으로 저장되었습니다.");
      onClose();
    } catch (error) {
      console.error("Error saving limits:", error);
      message.error("인원 제한 저장 실패");
    }
  };

  const handleTimeSelect = (time: string) => {
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
      title="시간별 인원 제한 설정"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          취소
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          저장
        </Button>,
      ]}
    >
      <Select
        value={day}
        onChange={(value) => setDay(value)}
        options={weekDays.map((day, index) => ({
          key: index,
          value: day,
          label: day,
        }))}
      />
      <Form layout="vertical">
        <Form.Item label="시간 선택">
          <TimePicker
            startTime={startTime}
            endTime={endTime}
            onTimeSelect={handleTimeSelect}
          />
        </Form.Item>
        <Form.Item label="인원 제한">
          <InputNumber
            value={limitNum}
            onChange={(value) =>
              setLimitNum(value !== null ? Math.max(value, 0) : 0)
            } // Ensure value is at least 0
            min={0} // Allow 0 as a valid input
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditTimeLimitModal;

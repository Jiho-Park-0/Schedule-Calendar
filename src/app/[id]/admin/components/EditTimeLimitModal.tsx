import React, { useEffect, useState } from "react";
import { Modal, InputNumber, Form, Button, message } from "antd";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
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
    const timeRange = `${startTime}-${endTime}`;
    try {
      const docRef = doc(
        scheduleCalendarFirestore,
        "profiles",
        profileId,
        "limit",
        timeRange
      );
      await setDoc(docRef, { startTime, endTime, limitNum });
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

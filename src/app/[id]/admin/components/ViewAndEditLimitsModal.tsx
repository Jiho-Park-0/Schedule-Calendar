import React, { useEffect, useState } from "react";
import { Modal, Button, Form, InputNumber, message, Select } from "antd";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { scheduleCalendarFirestore } from "@/firebase";

interface ViewAndEditLimitsModalProps {
  visible: boolean;
  onClose: () => void;
  profileId: string;
}

const ViewAndEditLimitsModal: React.FC<ViewAndEditLimitsModalProps> = ({
  visible,
  onClose,
  profileId,
}) => {
  const [limits, setLimits] = useState<
    {
      id: string;
      startTime: string;
      endTime: string;
      limitNum: number;
      day: string;
    }[]
  >([]);

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  useEffect(() => {
    if (visible) {
      const fetchLimits = async () => {
        const limitCollectionRef = collection(
          scheduleCalendarFirestore,
          "profiles",
          profileId,
          "limit"
        );
        const querySnapshot = await getDocs(limitCollectionRef);
        const limitsData: {
          id: string;
          startTime: string;
          endTime: string;
          limitNum: number;
          day: string;
        }[] = [];
        querySnapshot.forEach((doc) => {
          limitsData.push({
            id: doc.id,
            startTime: doc.data().startTime,
            endTime: doc.data().endTime,
            limitNum: doc.data().limitNum,
            day: doc.data().day,
          });
        });
        setLimits(limitsData);
      };

      fetchLimits();
    }
  }, [visible, profileId]);

  const handleSave = async () => {
    try {
      for (const limit of limits) {
        const newLimitNum = limit.limitNum; // Get updated limit number

        const docRef = doc(
          scheduleCalendarFirestore,
          "profiles",
          profileId,
          "limit",
          limit.id
        );

        await setDoc(docRef, {
          startTime: limit.startTime,
          endTime: limit.endTime,
          limitNum: newLimitNum,
          day: limit.day,
        });
      }
      message.success("인원 제한이 성공적으로 저장되었습니다."); // Show message once after all updates
    } catch (error) {
      console.error("Error saving limits:", error);
      message.error("인원 제한 저장 실패");
    }
    onClose(); // Close modal after saving
  };

  const handleDelete = async (id: string) => {
    try {
      const docRef = doc(
        scheduleCalendarFirestore,
        "profiles",
        profileId,
        "limit",
        id
      );
      await deleteDoc(docRef);
      message.success("인원 제한이 성공적으로 삭제되었습니다.");
      setLimits(limits.filter((limit) => limit.id !== id)); // Remove deleted limit from state
    } catch (error) {
      console.error("Error deleting limit:", error);
      message.error("인원 제한 삭제 실패");
    }
  };

  const handleLimitChange = (id: string, newLimitNum: number) => {
    setLimits((prevLimits) =>
      prevLimits.map((limit) =>
        limit.id === id ? { ...limit, limitNum: newLimitNum } : limit
      )
    );
  };

  const handleDayChange = (id: string, newDay: string) => {
    setLimits((prevLimits) =>
      prevLimits.map((limit) =>
        limit.id === id ? { ...limit, day: newDay } : limit
      )
    );
  };

  return (
    <Modal
      title="인원 제한 수정"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          취소
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          확인
        </Button>,
      ]}
    >
      <Form layout="vertical" className="flex flex-col gap-4">
        {limits.map((limit) => (
          <Form.Item
            key={limit.id}
            label={`시간: ${limit.startTime} - ${limit.endTime}`}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center gap-4">
              <InputNumber
                style={{ width: 80 }}
                min={0}
                value={limit.limitNum} // Use value instead of defaultValue
                onChange={(value) => handleLimitChange(limit.id, value || 0)} // Update limit number
              />
              <Select
                value={limit.day}
                onChange={(value) => handleDayChange(limit.id, value)} // Update day
                options={weekDays.map((day, index) => ({
                  key: index,
                  value: day,
                  label: day,
                }))}
              />
              <Button type="link" danger onClick={() => handleDelete(limit.id)}>
                삭제
              </Button>
            </div>
          </Form.Item>
        ))}
      </Form>
    </Modal>
  );
};

export default ViewAndEditLimitsModal;

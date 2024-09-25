import React, { useEffect, useState } from "react";
import { Modal, Table } from "antd";
import { getDocs, query, collection } from "firebase/firestore";
import { scheduleCalendarFirestore } from "@/firebase";

interface ScheduleLimitModalProps {
  teacherId: string;
  visible: boolean;
  onClose: () => void;
}

const ScheduleLimitModal: React.FC<ScheduleLimitModalProps> = ({
  teacherId,
  visible,
  onClose,
}) => {
  const [limits, setLimits] = useState<
    {
      day: string;
      startTime: string;
      endTime: string;
      limitNum: number;
      count: number;
    }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLimits = async () => {
      setLoading(true);
      const limitQuery = query(
        collection(scheduleCalendarFirestore, `profiles/${teacherId}/limit`)
      );
      const limitSnapshot = await getDocs(limitQuery);
      const studentQuery = query(
        collection(scheduleCalendarFirestore, `profiles/${teacherId}/student`)
      );
      const studentSnapshot = await getDocs(studentQuery);

      const limitData = limitSnapshot.docs.map((limitDoc) => {
        const { startTime, endTime, limitNum, day } = limitDoc.data();
        let count = 0;
        const studentTimes: { startTime: Date; endTime: Date }[] = [];

        studentSnapshot.docs.forEach((studentDoc) => {
          const {
            startTime: studentStart,
            endTime: studentEnd,
            day: studentDay,
          } = studentDoc.data();
          if (day === studentDay) {
            const studentStartTime = new Date(`1970-01-01T${studentStart}:00`);
            const studentEndTime = new Date(`1970-01-01T${studentEnd}:00`);
            studentTimes.push({
              startTime: studentStartTime,
              endTime: studentEndTime,
            });
          }
        });

        // 겹치는 시간대 병합
        studentTimes.sort(
          (a, b) => a.startTime.getTime() - b.startTime.getTime()
        );
        const mergedTimes: { startTime: Date; endTime: Date }[] = [];
        studentTimes.forEach((time) => {
          if (mergedTimes.length === 0) {
            mergedTimes.push(time);
          } else {
            const lastMergedTime = mergedTimes[mergedTimes.length - 1];
            if (time.startTime <= lastMergedTime.endTime) {
              lastMergedTime.endTime = new Date(
                Math.max(
                  lastMergedTime.endTime.getTime(),
                  time.endTime.getTime()
                )
              );
            } else {
              mergedTimes.push(time);
            }
          }
        });

        // 제한 시간대와 겹치는 학생들의 수 카운트
        const limitStartTime = new Date(`1970-01-01T${startTime}:00`);
        const limitEndTime = new Date(`1970-01-01T${endTime}:00`);
        mergedTimes.forEach((time) => {
          if (time.startTime < limitEndTime && time.endTime > limitStartTime) {
            count++;
          }
        });

        return { day, startTime, endTime, limitNum, count };
      });

      setLimits(limitData);
      setLoading(false);
    };

    if (visible) {
      fetchLimits();
    }
  }, [teacherId, visible]);

  const columns = [
    { title: "요일", dataIndex: "day", key: "day" },
    { title: "시작 시간", dataIndex: "startTime", key: "startTime" },
    { title: "종료 시간", dataIndex: "endTime", key: "endTime" },
    { title: "제한 인원", dataIndex: "limitNum", key: "limitNum" },
    { title: "현재 인원", dataIndex: "count", key: "count" },
  ];

  return (
    <Modal
      title="수강 제한 요일 및 시간대"
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <Table
        dataSource={limits}
        columns={columns}
        rowKey={(record) =>
          `${record.day}-${record.startTime}-${record.endTime}`
        }
        loading={loading}
      />
    </Modal>
  );
};

export default ScheduleLimitModal;

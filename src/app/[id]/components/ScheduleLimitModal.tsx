import React, { useEffect, useState } from "react";
import { Modal, Table } from "antd";
import { getDocs, query, collection } from "firebase/firestore";
import { scheduleCalendarFirestore } from "@/firebase";

interface ScheduleLimitModalProps {
  teacherId: string;
  visible: boolean;
  onClose: () => void;
}

const changeStringToTime = (time: string) => {
  const [hour, minute] = time.split(":");
  return Number(hour) * 60 + Number(minute);
};

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
        const {
          startTime: limitStart,
          endTime: limitEnd,
          limitNum,
          day: limitDay,
        } = limitDoc.data();
        let count = 0;

        const limitStartChange = changeStringToTime(limitStart);
        const limitEndChange = changeStringToTime(limitEnd);
        for (const studentDoc of studentSnapshot.docs) {
          const {
            startTime: studentStart,
            endTime: studentEnd,
            day: studentDay,
          } = studentDoc.data();
          if (limitDay === studentDay) {
            console.log("student", studentStart, studentEnd);
            if (studentDay !== limitDay) continue;

            const studentStartChange = changeStringToTime(studentStart);
            const studentEndChange = changeStringToTime(studentEnd);

            if (
              (limitStartChange <= studentStartChange &&
                studentStartChange < limitEndChange) ||
              (limitStartChange < studentEndChange &&
                studentEndChange <= limitEndChange)
            ) {
              console.log(
                "겹치는 시간대가 있습니다.",
                studentStart,
                studentEnd
              );
              count++;
            }
          }
        }
        console.log(count);

        return {
          day: limitDay,
          startTime: limitStart,
          endTime: limitEnd,
          limitNum,
          count,
        };
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

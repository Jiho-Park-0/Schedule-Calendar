"use client";

import { useEffect, useState } from "react";
import { Button, Space, Typography } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import moment from "moment";
import "moment/locale/ko"; // 한국어 로케일을 사용하기 위해 추가
import { useParams } from "next/navigation";
import AddClassModal from "@/app/[id]/components/AddClassModal";
import EditClassModal from "@/app/[id]/components/EditClassModal";
import TeacherActionModal from "@/app/[id]/components/TeacherActionModal";
import DeleteScheduleButton from "@/app/[id]/components/DeleteScheduleButton";
import LoadScheduleButton from "@/app/[id]/components/LoadScheduleButton";
import DeleteClassButton from "@/app/[id]/components/DeleteClassButton";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { scheduleCalendarFirestore } from "@/firebase";

const { Title, Text } = Typography;

export default function CalendarPage() {
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false);
  const [isTeacherActionModalOpen, setIsTeacherActionModalOpen] =
    useState(false);
  const [currentWeek, setCurrentWeek] = useState(moment());
  const [actionType, setActionType] = useState<
    "deleteSchedule" | "loadSchedule" | "deleteClass"
  >("deleteSchedule");
  const [selectedDate, setSelectedDate] = useState<moment.Moment | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<{
    id: string; // Change id type to string to match uuid
    name: string;
    startTime: string;
    endTime: string;
    date: string;
  } | null>(null); // selectedSchedule 상태 추가
  const [scheduleData, setScheduleData] = useState<
    {
      id: number;
      name: string;
      startTime: string;
      endTime: string;
      date: string;
    }[]
  >([]);

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekDates = Array.from({ length: 7 }, (_, i) =>
    moment(currentWeek).startOf("week").add(i, "days")
  );

  const moveWeek = (direction: number) => {
    setCurrentWeek(currentWeek.clone().add(direction, "weeks"));
  };

  const { id } = useParams() as { id: string };
  const [profile, setProfile] = useState<{
    id: string;
    name: string;
    password: string;
    backgroundColor: string;
  } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docRef = doc(scheduleCalendarFirestore, "profiles", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const profileData = docSnap.data();

          setProfile(
            profileData as {
              id: string;
              name: string;
              password: string;
              backgroundColor: string;
            }
          );
        } else {
          console.error("Profile not found");
          setProfile(null);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile();
  }, [id]);

  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        const startOfWeek = currentWeek.startOf("week").format("YYYY-MM-DD");
        const endOfWeek = currentWeek.endOf("week").format("YYYY-MM-DD");

        const q = query(
          collection(
            scheduleCalendarFirestore,
            `profiles/${id}/${currentWeek.format(
              "YYYY년 M월"
            )} ${getWeekOfMonth(currentWeek)}`
          ),
          where("date", ">=", startOfWeek),
          where("date", "<=", endOfWeek)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const data = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            startTime: doc.data().startTime || "",
            endTime: doc.data().endTime || "",
          }));
          setScheduleData(
            data as unknown as {
              id: number;
              name: string;
              startTime: string;
              endTime: string;
              date: string;
            }[]
          );
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Failed to fetch schedule data:", error);
      }
    };

    fetchScheduleData();
  }, [id, currentWeek]);

  const handleAction = (
    type: "deleteSchedule" | "loadSchedule" | "deleteClass"
  ) => {
    setActionType(type);
    setIsTeacherActionModalOpen(true);
  };

  const getWeekOfMonth = (date: moment.Moment) => {
    const WEEK_KOR = ["1주차", "2주차", "3주차", "4주차", "5주차"];
    const weekDates = Array.from({ length: 7 }, (_, i) =>
      moment(date).startOf("week").add(i, "days")
    );

    // weekDates[4]가 포함된 월을 기준으로 주차를 계산
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

  const getDisplayMonth = (weekStart: moment.Moment) => {
    const weekDates = Array.from({ length: 7 }, (_, i) =>
      moment(weekStart).startOf("week").add(i, "days")
    );
    const referenceDate = weekDates[4];
    return `${referenceDate.format("M")}월`;
  };

  const handleAddClassClick = (date: moment.Moment) => {
    setSelectedDate(date);
    setIsAddClassModalOpen(true);
  };

  const handleEditClassClick = (schedule: {
    id: string; // Change id type to string to match uuid
    name: string;
    startTime: string;
    endTime: string;
    date: string;
    password: string;
  }) => {
    setSelectedSchedule(schedule); // selectedSchedule 상태 업데이트
    setIsEditClassModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="bg-white shadow rounded-lg p-6 mb-8 flex justify-between items-center">
          <div>
            <Title level={1}>
              {decodeURI(profile?.name || "")} 선생님의 시간표
            </Title>
            <Text>
              {currentWeek.year()}년 {getDisplayMonth(currentWeek)}{" "}
              {getWeekOfMonth(currentWeek)} 주차 시간표
            </Text>
          </div>
          <Space>
            <Button>전체 시간표 표시</Button>
            <DeleteScheduleButton
              onClick={() => handleAction("deleteSchedule")}
            />
            <LoadScheduleButton onClick={() => handleAction("loadSchedule")} />
            <DeleteClassButton onClick={() => handleAction("deleteClass")} />
          </Space>
        </header>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <Button onClick={() => moveWeek(-1)} icon={<LeftOutlined />} />
            <Title level={2}>주간 시간표</Title>
            <Button onClick={() => moveWeek(1)} icon={<RightOutlined />} />
          </div>
          <div className="grid grid-cols-7 gap-4">
            {weekDays.map((day, index) => (
              <div key={day} className="text-center">
                <div className="font-semibold">{day}</div>
                <div className="text-sm text-gray-500">
                  {weekDates[index].date()}
                </div>
              </div>
            ))}
            {weekDates.map((date, index) => (
              <div key={index} className="border p-2 min-h-[200px]">
                <Button
                  size="small"
                  className="w-full mb-2"
                  onClick={() => handleAddClassClick(date)}
                >
                  추가
                </Button>
                <div className="text-sm space-y-1">
                  {scheduleData
                    .filter(
                      (schedule) => schedule.date === date.format("YYYY-MM-DD")
                    )
                    .map((schedule, idx) => (
                      <div
                        key={idx}
                        className="bg-blue-100 p-1 rounded flex justify-between items-center cursor-pointer hover:bg-blue-200 active:bg-blue-300"
                        onClick={() =>
                          handleEditClassClick({
                            ...schedule,
                            password: "",
                            id: schedule.id.toString(),
                          })
                        }
                      >
                        <span>
                          {schedule.name} {schedule.startTime}-
                          {schedule.endTime}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* 수업 추가 모달 */}
      <AddClassModal
        isOpen={isAddClassModalOpen}
        onClose={() => setIsAddClassModalOpen(false)}
        selectedDate={selectedDate}
        teacherId={id}
      />
      {/* 수업 수정 모달 */}
      <EditClassModal
        isOpen={isEditClassModalOpen}
        onClose={() => setIsEditClassModalOpen(false)}
        selectedSchedule={selectedSchedule} // selectedSchedule 전달
        teacherId={id}
      />
      {/* 선생님 인증 모달 */}
      <TeacherActionModal
        isOpen={isTeacherActionModalOpen}
        onClose={() => setIsTeacherActionModalOpen(false)}
        actionType={actionType}
      />
    </div>
  );
}

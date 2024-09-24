"use client";

import { useEffect, useState } from "react";
import { Button, Space, Typography } from "antd";
// import { LeftOutlined, RightOutlined } from "@ant-design/icons";
// import moment from "moment";
import "moment/locale/ko"; // 한국어 로케일을 사용하기 위해 추가
import { useParams } from "next/navigation";
import AddClassModal from "@/app/[id]/components/AddClassModal";
import EditClassModal from "@/app/[id]/components/EditClassModal";
import TeacherActionModal from "@/app/[id]/components/TeacherActionModal";

import DeleteClassButton from "@/app/[id]/components/DeleteClassButton";
import { doc, getDoc, collection, query, onSnapshot } from "firebase/firestore";
import { scheduleCalendarFirestore } from "@/firebase";

const { Title } = Typography;

export default function CalendarPage() {
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false);
  const [isTeacherActionModalOpen, setIsTeacherActionModalOpen] =
    useState(false);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<{
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    day: string;
  } | null>(null);
  const [scheduleData, setScheduleData] = useState<
    {
      id: string;
      name: string;
      startTime: string;
      endTime: string;
      day: string;
    }[]
  >([]);

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  // const moveWeek = (direction: number) => {
  //   setCurrentWeek(currentWeek.clone().add(direction, "weeks"));
  // };

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
        const q = query(
          collection(scheduleCalendarFirestore, `profiles/${id}/student`)
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
              id: string;
              name: string;
              startTime: string;
              endTime: string;
              day: string;
            }[]
          );
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Failed to fetch schedule data:", error);
      }
    };

    fetchScheduleData();
  }, [id]);

  const handleAddClassClick = (day: string) => {
    setSelectedDay(day);
    setIsAddClassModalOpen(true);
  };

  const handleEditClassClick = (schedule: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    day: string;
  }) => {
    setSelectedSchedule(schedule);
    setIsEditClassModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="bg-white shadow rounded-lg p-4 md:p-6 mb-4 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-lg md:text-2xl lg:text-3xl font-bold">
              {decodeURI(profile?.name || "")} 선생님의 시간표
            </h1>
          </div>
          <Space className="mt-4 md:mt-0 ">
            {/* <DeleteScheduleButton
              teacherId={id}
              currentWeekString={currentWeekString}
            /> */}
            {/* <LoadScheduleButton
              teacherId={id}
              currentWeekString={currentWeekString}
            /> */}
            <DeleteClassButton teacherId={id} />
          </Space>
        </header>

        <div className="bg-white shadow rounded-lg p-4 md:p-6">
          <div className="flex justify-center items-center mb-4">
            <Title
              level={2}
              className="text-lg md:text-xl lg:text-2xl text-center"
            >
              주간 시간표
            </Title>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 md:gap-4">
            {weekDays.map((day, index) => (
              <div
                key={index}
                className="border p-2 min-h-[150px] md:min-h-[200px]"
              >
                <div className="text-center mb-2">
                  <div className="font-semibold text-sm md:text-base">
                    {day}
                  </div>
                </div>
                <Button
                  size="small"
                  className="w-full mb-2"
                  onClick={() => handleAddClassClick(day)}
                >
                  추가
                </Button>
                <div className="text-xs md:text-sm space-y-1">
                  {scheduleData
                    .filter((schedule) => schedule.day === day)
                    .map((schedule, idx) => (
                      <div
                        key={idx}
                        className="bg-blue-100 p-1 rounded flex justify-between items-center cursor-pointer hover:bg-blue-200 active:bg-blue-300"
                        onClick={() =>
                          handleEditClassClick({
                            ...schedule,
                            id: schedule.id.toString(),
                          })
                        }
                      >
                        <span>
                          {schedule.name} <br />
                          {schedule.startTime}-{schedule.endTime}
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
        selectedDay={selectedDay}
        teacherId={id}
      />
      {/* 수업 수정 모달 */}
      <EditClassModal
        isOpen={isEditClassModalOpen}
        onClose={() => setIsEditClassModalOpen(false)}
        selectedSchedule={selectedSchedule}
        teacherId={id}
      />
      {/* 선생님 인증 모달 */}
      <TeacherActionModal
        isOpen={isTeacherActionModalOpen}
        onClose={() => setIsTeacherActionModalOpen(false)}
        teacherId={id}
      />
    </div>
  );
}

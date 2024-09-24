"use client";

import { useState, useEffect } from "react";
import { Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { collection, getDocs } from "firebase/firestore";
import { scheduleCalendarFirestore } from "@/firebase"; // Adjust the import path as needed
import { useParams } from "next/navigation";

const months = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
];

interface Schedule {
  date: string;
  dayOfWeek: string;
  endTime: string;
  name: string;
  password: string;
  startTime: string;
}

interface ScheduleData {
  [date: string]: Schedule[];
}

export default function FullPage() {
  const params = useParams();
  const id = params?.id as string;
  const [currentMonth, setCurrentMonth] = useState<number>(
    new Date().getMonth()
  );
  const [currentYear, setCurrentYear] = useState<number>(
    new Date().getFullYear()
  );
  const [scheduleData, setScheduleData] = useState<ScheduleData>({});

  useEffect(() => {
    const fetchProfileAndData = async () => {
      if (!id) return;

      const profileResponse = await fetch(`/api/loadProfile?teacherId=${id}`);
      const profile = await profileResponse.json();

      if (profile.error) {
        console.error(profile.error);
        return;
      }

      const { "시간표 리스트": scheduleList } = profile;

      // Fetch schedule data from Firestore
      const data: ScheduleData = {};
      for (const schedulePath of scheduleList) {
        const querySnapshot = await getDocs(
          collection(
            scheduleCalendarFirestore,
            `profiles/${id}/${schedulePath}`
          )
        );

        querySnapshot.forEach((doc) => {
          const schedule = doc.data() as Schedule;
          const date = schedule.date;
          if (!data[date]) {
            data[date] = [];
          }
          data[date].push(schedule);
        });
      }

      setScheduleData(data);
    };

    fetchProfileAndData();
  }, [id]);

  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay();
  };

  const changeMonth = (delta: number): void => {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const renderCalendar = (): JSX.Element[] => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days: JSX.Element[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}-${String(i).padStart(2, "0")}`;
      const daySchedules = scheduleData[currentDate] || [];

      days.push(
        <div key={i} className="border p-2 h-auto">
          <div className="font-bold text-sm md:text-base lg:text-lg">{i}</div>
          {daySchedules.map((schedule, index) => (
            <div
              key={index}
              className="text-[10px] sm:text-xs md:text-sm lg:text-base whitespace-normal break-words bg-blue-100 p-1 mt-1 rounded"
            >
              <div className="font-semibold">{schedule.name}</div>
              <div>
                {schedule.startTime} - {schedule.endTime}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-full mx-auto">
        <header className="bg-white shadow rounded-lg p-4 md:p-6 mb-4 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
            전체 시간표
          </h1>
          <div className="flex items-center space-x-2">
            <Button
              className="text-sm md:text-base lg:text-lg"
              onClick={() => (window.location.href = `/${id}`)}
            >
              돌아가기
            </Button>
          </div>
        </header>

        <div className="bg-white shadow rounded-lg p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <Button
              className="text-sm md:text-base lg:text-lg"
              onClick={() => changeMonth(-1)}
            >
              <LeftOutlined className="h-4 w-4" />
            </Button>
            <h2 className="text-lg md:text-xl lg:text-2xl font-semibold">
              {currentYear}년 {months[currentMonth]}
            </h2>
            <Button
              className="text-sm md:text-base lg:text-lg"
              onClick={() => changeMonth(1)}
            >
              <RightOutlined className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2 text-xs md:text-sm lg:text-base">
            {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
              <div key={day} className="text-center font-semibold">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-xs md:text-sm lg:text-base">
            {renderCalendar()}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { message } from "antd";
import AddClassModal from "@/app/[id]/components/AddClassModal";
import EditAdminClassModal from "@/app/[id]/admin/components/EditAdminClassModal";
import TeacherActionModal from "@/app/[id]/admin/components/TeacherActionModal";
import AdminHeader from "@/app/[id]/admin/components/AdminHeader";
import AdminWeeklySchedule from "@/app/[id]/admin/components/AdminWeeklySchedule";

import { doc, getDoc, collection, query, onSnapshot } from "firebase/firestore";
import { scheduleCalendarFirestore } from "@/firebase";

export default function AdminPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");

    if (isAuthenticated !== "true") {
      message.error("접근 권한이 없습니다.");
      router.push(`/${id}`); // Redirect to the main page
    }
  }, [id, router]);

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
    backgroundColor: string;
    password: string;
  } | null>(null);
  const [scheduleData, setScheduleData] = useState<
    {
      id: string;
      name: string;
      startTime: string;
      endTime: string;
      day: string;
      backgroundColor: string;
      password: string;
    }[]
  >([]);

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
  const timeSlots = Array.from({ length: 27 }, (_, i) => {
    const hour = Math.floor(i / 2) + 10;
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  });

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
              backgroundColor: string;
              password: string;
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
    backgroundColor: string;
    password: string;
  }) => {
    setSelectedSchedule(schedule);
    setIsEditClassModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="w-full ">
        <AdminHeader profileName={profile?.name || ""} teacherId={id} />
        <AdminWeeklySchedule
          weekDays={weekDays}
          timeSlots={timeSlots}
          scheduleData={scheduleData}
          onAddClassClick={handleAddClassClick}
          onEditClassClick={handleEditClassClick}
        />
      </div>

      <AddClassModal
        isOpen={isAddClassModalOpen}
        onClose={() => setIsAddClassModalOpen(false)}
        selectedDay={selectedDay}
        teacherId={id}
      />
      {/* <EditClassModal
        isOpen={isEditClassModalOpen}
        onClose={() => setIsEditClassModalOpen(false)}
        selectedSchedule={selectedSchedule}
        teacherId={id}
      /> */}
      <EditAdminClassModal
        isOpen={isEditClassModalOpen}
        onClose={() => setIsEditClassModalOpen(false)}
        selectedSchedule={selectedSchedule}
        teacherId={id}
      />
      <TeacherActionModal
        isOpen={isTeacherActionModalOpen}
        onClose={() => setIsTeacherActionModalOpen(false)}
        teacherId={id}
      />
    </div>
  );
}

import { useState, useEffect } from "react";
import { Modal, Input, message, Select } from "antd";
import { useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  deleteDoc,
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { scheduleCalendarFirestore } from "@/firebase";
import axios from "axios";
import dayjs from "dayjs"; // dayjs를 사용하여 날짜 계산

interface TeacherActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: "deleteSchedule" | "loadSchedule" | "deleteClass";
  teacherId: string; // Add teacherId prop
  currentWeekString: string;
}

interface Profile {
  id: number; // Change to number to match profile.json
  name: string;
  password: string;
  backgroundColor: string;
  "시간표 리스트": string[];
}

const TeacherActionModal: React.FC<TeacherActionModalProps> = ({
  isOpen,
  onClose,
  actionType,
  teacherId,
  currentWeekString,
}) => {
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedSchedules, setSelectedSchedules] = useState<string[]>([]);
  const [scheduleList, setScheduleList] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Firestore에서 프로필 정보 가져오기
        const docRef = doc(scheduleCalendarFirestore, "profiles", teacherId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const profileData = docSnap.data() as Profile;

          setProfile(profileData);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfile();
  }, [teacherId]);

  useEffect(() => {
    const fetchScheduleList = async () => {
      try {
        const response = await axios.get("/profile.json");
        const profiles: Profile[] = response.data;
        const teacherProfile = profiles.find(
          (p) => p.id === parseInt(teacherId, 10)
        ); // Ensure id is treated as number

        if (teacherProfile) {
          const sortedScheduleList = [
            ...teacherProfile["시간표 리스트"],
          ].sort();

          setScheduleList(sortedScheduleList);
        } else {
          console.error("Teacher profile not found in profile.json");
        }
      } catch (error) {
        console.error("Error fetching schedule list:", error);
      }
    };

    if (actionType === "loadSchedule" || actionType === "deleteSchedule") {
      fetchScheduleList();
    }
  }, [actionType, teacherId]);

  useEffect(() => {
    if (!isOpen) {
      setPassword("");
      setSelectedSchedules([]);
    }
  }, [isOpen]);

  const handleOk = async () => {
    console.log("Profile password:", profile?.password); // 로그 추가
    console.log("Entered password:", password);
    if (profile && profile.password === password) {
      if (actionType === "deleteSchedule") {
        try {
          // Delete selected schedules from Firestore
          for (const schedule of selectedSchedules) {
            const scheduleCollectionRef = collection(
              scheduleCalendarFirestore,
              `profiles/${teacherId}/${schedule}`
            );
            const scheduleDocs = await getDocs(scheduleCollectionRef);
            for (const doc of scheduleDocs.docs) {
              await deleteDoc(doc.ref);
            }
          }

          // Update profile.json to remove selected schedules using custom API endpoint
          await axios.post("/api/updateProfile", {
            teacherId,
            formattedPaths: selectedSchedules,
            action: "delete",
          });

          message.success("스케줄 삭제 성공");
          onClose();
        } catch (error) {
          console.error("Error deleting schedules:", error);
          message.error("스케줄 삭제 실패");
        }
      } else if (actionType === "loadSchedule") {
        try {
          // Load selected schedules to current week

          for (const schedule of selectedSchedules) {
            const scheduleCollectionRef = collection(
              scheduleCalendarFirestore,
              `profiles/${teacherId}/${schedule}`
            );
            const scheduleDocs = await getDocs(scheduleCollectionRef);
            for (const doc of scheduleDocs.docs) {
              const data = doc.data();

              const newDate = calculateNewDate(
                data.dayOfWeek,
                currentWeekString
              );
              console.log(newDate);
              await addDoc(
                collection(
                  scheduleCalendarFirestore,
                  `profiles/${teacherId}/${currentWeekString}`
                ),
                { ...data, date: newDate }
              );
            }
          }

          // Update profile.json to add current week string if not already present
          await axios.post("/api/updateProfile", {
            teacherId,
            formattedPaths: [currentWeekString],
            action: "add",
          });

          message.success("스케줄 불러오기 성공");
          onClose();
        } catch (error) {
          console.error("Error loading schedules:", error);
          message.error("스케줄 불러오기 실패");
        }
      } else if (actionType === "deleteClass") {
        try {
          await deleteDoc(
            doc(scheduleCalendarFirestore, "profiles", teacherId)
          );
          message.success("반 삭제 성공");
          onClose();
          router.push("/"); // 메인 페이지로 리다이렉션
        } catch (error) {
          console.error("Error deleting class:", error);
          message.error("반 삭제 실패");
        }
      }
    } else {
      message.error("비밀번호가 일치하지 않습니다.");
    }
  };

  // console.log(currentWeekString);
  const calculateNewDate = (dayOfWeek: string, currentWeekString: string) => {
    // 1. currentWeekString에서 숫자 부분만 추출
    const year = currentWeekString.match(/\d{4}/)?.[0]; // 4자리 숫자 (연도)
    const month = currentWeekString.match(/\d{1,2}(?=월)/)?.[0]; // 월
    const week = currentWeekString.match(/\d{1}(?=주차)/)?.[0]; // 주차

    if (!year || !month || !week) {
      throw new Error("잘못된 날짜 형식입니다.");
    }

    // 2. 해당 연도, 월의 첫째 주 시작일 계산
    const startOfMonth = dayjs(`${year}-${month}-01`);
    const startOfWeek = startOfMonth
      .startOf("week")
      .add(parseInt(week) - 1, "week");

    // 3. dayOfWeek 문자열에 따른 요일 인덱스 계산
    const dayIndex = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ].indexOf(dayOfWeek);

    if (dayIndex === -1) {
      throw new Error("잘못된 요일입니다.");
    }

    // 4. 해당 요일의 날짜 계산
    return startOfWeek.add(dayIndex, "day").format("YYYY-MM-DD");
  };

  return (
    <Modal title="선생님 인증" open={isOpen} onCancel={onClose} onOk={handleOk}>
      {actionType === "loadSchedule" && (
        <div>현재 위치한 주간 시간표에 불러옵니다.</div>
      )}
      {actionType === "deleteSchedule" && (
        <div>선택한 시간표를 일괄 삭제합니다.</div>
      )}
      {actionType === "deleteClass" && (
        <div>현재 반과 등록된 선생님의 정보를 삭제합니다.</div>
      )}
      <div className="py-4">
        <label htmlFor="teacher-action-password">비밀번호를 입력하세요</label>
        <Input
          id="teacher-action-password"
          type="password"
          className="mt-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {(actionType === "loadSchedule" || actionType === "deleteSchedule") &&
          scheduleList.length > 0 && (
            <div className="mt-4">
              <label htmlFor="select-schedules">
                {actionType === "loadSchedule"
                  ? "불러올 시간표를 선택하세요"
                  : "삭제할 시간표를 선택하세요"}
              </label>
              <Select
                id="select-schedules"
                placeholder="Please select"
                className="w-full"
                mode={actionType === "loadSchedule" ? undefined : "multiple"} // Single select for loadSchedule
                value={selectedSchedules}
                onChange={(value) =>
                  setSelectedSchedules(Array.isArray(value) ? value : [value])
                }
                options={scheduleList.map((schedule) => ({
                  value: schedule,
                  label: schedule,
                }))}
              />
            </div>
          )}
      </div>
    </Modal>
  );
};

export default TeacherActionModal;

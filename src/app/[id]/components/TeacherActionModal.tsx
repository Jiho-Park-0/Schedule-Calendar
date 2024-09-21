import { useState, useEffect } from "react";
import { Modal, Input, message, Select } from "antd";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { scheduleCalendarFirestore } from "@/firebase";

interface TeacherActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: "deleteSchedule" | "loadSchedule" | "deleteClass";
}

interface Profile {
  id: string;
  name: string;
  password: string;
  backgroundColor: string;
}

const TeacherActionModal: React.FC<TeacherActionModalProps> = ({
  isOpen,
  onClose,
  actionType,
}) => {
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const { id } = useParams() as { id: string };
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const router = useRouter(); // useRouter 추가

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docRef = doc(scheduleCalendarFirestore, "profiles", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const profileData = docSnap.data() as Profile;
          setProfile(profileData);
        } else {
          console.error("Profile not found");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfile();
  }, [id]);

  const handleOk = async () => {
    if (profile && profile.password === password) {
      if (actionType === "deleteSchedule") {
        // Implement schedule deletion logic here
        message.success("스케줄 삭제 성공");
      } else if (actionType === "loadSchedule") {
        // Implement schedule loading logic here
        message.success("스케줄 불러오기 성공");
      } else if (actionType === "deleteClass") {
        try {
          await deleteDoc(doc(scheduleCalendarFirestore, "profiles", id));
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

  return (
    <Modal title="선생님 인증" open={isOpen} onCancel={onClose} onOk={handleOk}>
      <div className="py-4">
        <label htmlFor="teacher-action-password">비밀번호를 입력하세요</label>
        <Input
          id="teacher-action-password"
          type="password"
          className="mt-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {actionType === "loadSchedule" && (
          <div className="mt-4">
            <label htmlFor="select-month">불러올 월을 선택하세요</label>
            <Select
              id="select-month"
              className="mt-2"
              value={selectedMonth}
              onChange={(value) => setSelectedMonth(value)}
              options={[
                { value: "2023-08", label: "2023년 8월" },
                { value: "2023-09", label: "2023년 9월" },
                // Add more months as needed
              ]}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default TeacherActionModal;

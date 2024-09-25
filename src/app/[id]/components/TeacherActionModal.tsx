import { useState, useEffect } from "react";
import { Modal, Input, message } from "antd";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { scheduleCalendarFirestore } from "@/firebase";

interface TeacherActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId: string;
}

interface Profile {
  id: number;
  name: string;
  password: string;
  backgroundColor: string;
}

const TeacherActionModal: React.FC<TeacherActionModalProps> = ({
  isOpen,
  onClose,
  teacherId,
}) => {
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
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
    if (!isOpen) {
      setPassword("");
    }
  }, [isOpen]);

  const handleOk = async () => {
    if (profile && profile.password === password) {
      message.success("인증 성공");
      onClose();
      router.push(`/${teacherId}/admin`); // Redirect to admin page
    } else {
      message.error("비밀번호가 일치하지 않습니다.");
    }
  };

  return (
    <Modal title="선생님 인증" open={isOpen} onCancel={onClose} onOk={handleOk}>
      <div>관리자 페이지로 이동하려면 비밀번호를 입력하세요.</div>
      <div className="py-4">
        <label htmlFor="teacher-action-password">비밀번호를 입력하세요</label>
        <Input
          id="teacher-action-password"
          type="password"
          className="mt-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
    </Modal>
  );
};

export default TeacherActionModal;

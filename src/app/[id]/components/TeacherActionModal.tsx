import { useState, useEffect } from "react";

import { Modal, Input, message, Select } from "antd";

import { useParams } from "next/navigation";

interface TeacherActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: "deleteSchedule" | "loadSchedule" | "deleteClass";
}

interface Profile {
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

  const [profiles, setProfiles] = useState<Profile[]>([]);

  const { name } = useParams() as { name: string };

  const [selectedMonth, setSelectedMonth] = useState<string>("");

  useEffect(() => {
    fetch("/profile.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        return response.json();
      })

      .then((data) => {
        setProfiles(data);
      })
      .catch((error) => {
        console.error("Error fetching profile data:", error);
      });
  }, []);

  const handleOk = () => {
    const decodedName = decodeURI(name);

    const profile = profiles.find((profile) => profile.name === decodedName);

    if (profile && profile.password === password) {
      if (actionType === "deleteSchedule") {
        // Implement schedule deletion logic here
        message.success("스케줄 삭제 성공");
      } else if (actionType === "loadSchedule") {
        // Implement schedule loading logic here
        message.success("스케줄 불러오기 성공");
      } else if (actionType === "deleteClass") {
        // Implement class deletion logic here
        message.success("반 삭제 성공");
      }
      onClose();
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

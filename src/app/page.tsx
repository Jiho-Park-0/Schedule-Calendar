"use client";

import { useState, useEffect } from "react";
import Box from "@/components/Box";
import { Button, Modal, Input, ColorPicker } from "antd";

export default function Home() {
  const [boxes, setBoxes] = useState<
    Array<{ name: string; password: string; backgroundColor: string }>
  >([]);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#1890ff");
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const response = await fetch("/profile.json");
      const data = await response.json();
      setBoxes(data);
    } catch (error) {
      console.error("Error loading profile data:", error);
    }
  };

  const handleAddBox = async () => {
    if (name && password) {
      const newBox = { name, password, backgroundColor };
      setBoxes([...boxes, newBox]);
      setName("");
      setPassword("");
      setBackgroundColor("#1890ff");
      setIsModalVisible(false);

      try {
        const response = await fetch("/api/saveProfile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newBox),
        });

        if (!response.ok) {
          throw new Error("Failed to save profile");
        }
      } catch (error) {
        console.error("Error saving profile:", error);
      }
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button type="primary" className="bg-blue-500" onClick={showModal}>
          시간표 추가
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {boxes.map((box, index) => (
          <Box
            key={index}
            name={box.name}
            backgroundColor={box.backgroundColor}
          />
        ))}
      </div>

      <Modal
        title="시간표 추가"
        open={isModalVisible}
        onOk={handleAddBox}
        onCancel={handleCancel}
      >
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름"
          style={{ marginBottom: 16 }}
        />
        <Input.Password
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          style={{ marginBottom: 16 }}
        />
        <div>
          <span>배경색: </span>
          <ColorPicker
            value={backgroundColor}
            onChange={(color) => setBackgroundColor(color.toHexString())}
          />
        </div>
      </Modal>
    </div>
  );
}

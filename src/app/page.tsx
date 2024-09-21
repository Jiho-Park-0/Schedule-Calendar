"use client";

import { useState, useEffect } from "react";
import { Button, Input, Modal, message } from "antd";
import Box from "@/components/Box";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  setDoc,
} from "firebase/firestore";
import { scheduleCalendarFirestore } from "@/firebase";

const colorOptions = [
  "#1890ff",
  "#52c41a",
  "#faad14",
  "#f5222d",
  "#722ed1",
  "#13c2c2",
  "#eb2f96",
  "#fa8c16",
  "#a0d911",
  "#2f54eb",
  "#fadb14",
  "#eb4d4b",
];

export default function MainPage() {
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
  const [boxes, setBoxes] = useState<
    Array<{
      id: string;
      name: string;
      password: string;
      backgroundColor: string;
    }>
  >([]);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [backgroundColor, setBackgroundColor] = useState(colorOptions[0]);

  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        const q = query(
          collection(scheduleCalendarFirestore, "profiles"),
          orderBy("id")
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => {
          console.log(doc.data());
          const { id, name, password, backgroundColor } = doc.data();
          return { id, name, password, backgroundColor };
        });
        setBoxes(data);
      } catch (error) {
        console.error("Error loading profile data:", error);
      }
    };

    fetchBoxes();
  }, []);

  const handleAddBox = async () => {
    if (name && password) {
      try {
        const q = query(
          collection(scheduleCalendarFirestore, "profiles"),
          orderBy("id", "desc")
        );
        const querySnapshot = await getDocs(q);
        const lastDoc = querySnapshot.docs[0];
        const newId = lastDoc ? parseInt(lastDoc.data().id) + 1 : 1;

        const newBox = {
          id: newId.toString(),
          name,
          password,
          backgroundColor,
        };

        // Use setDoc to specify the document ID as the id
        await setDoc(
          doc(scheduleCalendarFirestore, "profiles", newBox.id),
          newBox
        );

        setBoxes([...boxes, newBox]);
        setName("");
        setPassword("");
        setBackgroundColor(colorOptions[0]);
        setIsCreateRoomModalOpen(false);
      } catch (error) {
        console.error("Error saving profile:", error);
        message.error("반 생성 실패");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="bg-white shadow rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">학원 스케줄러</h1>
          <p className="mt-2 text-gray-600">
            선생님들의 반 목록입니다. 클릭하여 시간표를 확인하세요.
          </p>
        </header>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">반 목록</h2>
            <Button
              type="primary"
              onClick={() => setIsCreateRoomModalOpen(true)}
            >
              시간표 생성
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boxes.map((room, index) => (
              <Box
                key={index}
                id={room.id}
                name={`${room.name}`}
                backgroundColor={room.backgroundColor}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 방 생성 모달 */}
      <Modal
        title="새 반 만들기"
        open={isCreateRoomModalOpen}
        onOk={handleAddBox}
        onCancel={() => setIsCreateRoomModalOpen(false)}
      >
        <Input
          placeholder="선생님 이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <Input.Password
          placeholder="반 입장 비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <div>
          <span>반 색상</span>
          <div className="grid grid-cols-6 gap-2 mt-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                className={`w-8 h-8 rounded-full border-2 ${
                  backgroundColor === color
                    ? "border-black"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setBackgroundColor(color)}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}

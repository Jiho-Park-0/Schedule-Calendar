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
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { scheduleCalendarFirestore } from "@/firebase";
import moment from "moment";

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

  const getWeekOfMonth = (date: moment.Moment) => {
    const WEEK_KOR = ["1주차", "2주차", "3주차", "4주차", "5주차"];
    const weekDates = Array.from({ length: 7 }, (_, i) =>
      moment(date).startOf("week").add(i, "days")
    );

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

        // Fetch existing profiles from profile.json
        const response = await fetch("/profile.json");
        const profiles = await response.json();

        // Check if the new ID already exists
        const idExists = profiles.some(
          (profile: { id: number }) => profile.id === newId
        );
        if (idExists) {
          message.error("ID already exists");
          return;
        }

        // Use setDoc to specify the document ID as the id
        await setDoc(
          doc(scheduleCalendarFirestore, "profiles", newBox.id),
          newBox
        );

        // Calculate the current week of the month
        const currentDate = moment();
        const weekOfMonth = getWeekOfMonth(currentDate);
        const month = currentDate.month() + 1; // month() is 0-indexed
        const year = currentDate.year();
        const weekLabel = `${year}년 ${month}월 ${weekOfMonth}`;

        const collectionPath = `profiles/${newBox.id}/${weekLabel}`;

        // Check and delete the "initial" document if it exists
        const initialDocRef = doc(
          scheduleCalendarFirestore,
          collectionPath,
          "initial"
        );
        const initialDocSnapshot = await getDoc(initialDocRef);
        if (initialDocSnapshot.exists()) {
          await deleteDoc(initialDocRef);
        }

        // Add an empty document to the new profile's schedule collection
        await setDoc(
          doc(
            collection(
              scheduleCalendarFirestore,
              "profiles",
              newBox.id,
              weekLabel
            ),
            "initial"
          ),
          {}
        );

        // Simulate updating profile.json
        const newProfile = {
          id: newId,
          "시간표 리스트": [],
        };
        // Assuming you have a function to handle the server-side update
        await updateProfileJson(newProfile);

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

  const updateProfileJson = async (newProfile: {
    id: number;
    "시간표 리스트": never[];
  }) => {
    try {
      const response = await fetch("/api/updateProfileJson", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProfile),
      });
      if (!response.ok) {
        throw new Error("Failed to update profile.json");
      }
    } catch (error) {
      console.error("Error updating profile.json:", error);
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
            {boxes.map(
              (
                room: { id: string; name: string; backgroundColor: string },
                index: number
              ) => (
                <Box
                  key={index}
                  id={room.id}
                  name={room.name}
                  backgroundColor={room.backgroundColor}
                />
              )
            )}
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

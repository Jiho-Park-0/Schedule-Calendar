"use client"; // 이 디렉티브를 추가하여 클라이언트 컴포넌트로 설정

import { useState, SetStateAction } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { scheduleCalendarFirestore } from "@/firebase";

export default function Home() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");

  const onClickUpLoadButton = async () => {
    try {
      // 입력된 이름을 문서 ID로 사용하여 "profiles" 컬렉션에 데이터 추가
      const docRef = doc(scheduleCalendarFirestore, "profiles", name);

      await setDoc(docRef, {
        id: "2",
        backgroundColor: "#ffffff",
        name: name,
        password: "password123",
      });

      console.log("Document successfully written!");
    } catch (e: unknown) {
      console.error("Error adding document: ", e);
    }
  };

  const onClickFetchButton = async () => {
    try {
      // "profiles" 컬렉션의 "1" 문서에서 데이터 가져오기
      const docRef = doc(scheduleCalendarFirestore, "profiles", "광현");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile(docSnap.data() as SetStateAction<typeof profile>);
        console.log("Document data:", docSnap.data());
      } else {
        console.log("No such document!");
      }
    } catch (e: unknown) {
      console.error("Error fetching document: ", e);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="이름 입력"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={onClickUpLoadButton}>등록</button>
      <button onClick={onClickFetchButton}>ID 1 정보 불러오기</button>
      {profile && (
        <div>
          <p>이름: {(profile as { name: string }).name}</p>
          <p>비밀번호: {(profile as { password: string }).password}</p>
          <p>
            배경 색상:{" "}
            {(profile as { backgroundColor: string }).backgroundColor}
          </p>
        </div>
      )}
    </div>
  );
}

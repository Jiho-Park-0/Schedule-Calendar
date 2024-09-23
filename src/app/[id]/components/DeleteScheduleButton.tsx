"use client";

import { Button } from "antd";
import { doc, getDoc } from "firebase/firestore";
import { scheduleCalendarFirestore } from "@/firebase"; // Assuming you have a firebase config file

interface DeleteScheduleButtonProps {
  teacherId: string;
}

async function fetchCollections(teacherId: string) {
  const docRef = doc(scheduleCalendarFirestore, `profiles/${teacherId}`);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    const collectionsList = data.collections || []; // Assuming 'collections' field contains the list of sub-collections
    console.log(collectionsList); // You can handle this list as needed
  } else {
    console.log("No such document!");
  }
}

export default function DeleteScheduleButton({
  teacherId,
}: DeleteScheduleButtonProps) {
  const onClick = () => {
    fetchCollections(teacherId);
  };

  return <Button onClick={onClick}>시간표 삭제</Button>;
}

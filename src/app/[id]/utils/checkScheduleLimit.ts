import { getDocs, query, collection } from "firebase/firestore";
import { scheduleCalendarFirestore } from "@/firebase";

export const checkScheduleLimit = async (
  teacherId: string,
  startTime: string,
  endTime: string,
  day: string
): Promise<boolean> => {
  const limitQuery = query(
    collection(scheduleCalendarFirestore, `profiles/${teacherId}/limit`)
  );
  const limitSnapshot = await getDocs(limitQuery);
  const studentQuery = query(
    collection(scheduleCalendarFirestore, `profiles/${teacherId}/student`)
  );
  const studentSnapshot = await getDocs(studentQuery);

  for (const limitDoc of limitSnapshot.docs) {
    const {
      startTime: limitStart,
      endTime: limitEnd,
      limitNum,
      day: limitDay,
    } = limitDoc.data();

    if (day !== limitDay) continue;

    const limitStartTime = new Date(`1970-01-01T${limitStart}:00`);
    const limitEndTime = new Date(`1970-01-01T${limitEnd}:00`);
    const newStartTime = new Date(`1970-01-01T${startTime}:00`);
    const newEndTime = new Date(`1970-01-01T${endTime}:00`);

    if (newStartTime < limitEndTime && newEndTime > limitStartTime) {
      let count = 0;

      for (const studentDoc of studentSnapshot.docs) {
        const { startTime: studentStart, endTime: studentEnd } =
          studentDoc.data();
        const studentStartTime = new Date(`1970-01-01T${studentStart}:00`);
        const studentEndTime = new Date(`1970-01-01T${studentEnd}:00`);

        // 겹치는 시간 계산
        const overlapStart = new Date(
          Math.max(studentStartTime.getTime(), limitStartTime.getTime())
        );
        const overlapEnd = new Date(
          Math.min(studentEndTime.getTime(), limitEndTime.getTime())
        );

        // 겹치는 시간이 있으면 카운트 증가
        if (overlapStart < overlapEnd) {
          count++;
        }
      }

      // 신청할 수 없는 시간대가 있는지 확인
      const overlapStart = new Date(
        Math.max(newStartTime.getTime(), limitStartTime.getTime())
      );
      const overlapEnd = new Date(
        Math.min(newEndTime.getTime(), limitEndTime.getTime())
      );

      // 인원 초과 시 신청 불가
      if (overlapStart < overlapEnd && count >= limitNum) {
        return false;
      }
    }
  }

  return true;
};

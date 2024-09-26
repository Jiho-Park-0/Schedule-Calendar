import { getDocs, query, collection } from "firebase/firestore";
import { scheduleCalendarFirestore } from "@/firebase";

const changeStringToTime = (time: string) => {
  const [hour, minute] = time.split(":");
  return Number(hour) * 60 + Number(minute);
};

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

    if (startTime < limitEnd && endTime > limitStart) {
      let count = 0;
      const limitStartChange = changeStringToTime(limitStart);
      const limitEndChange = changeStringToTime(limitEnd);
      for (const studentDoc of studentSnapshot.docs) {
        const {
          startTime: studentStart,
          endTime: studentEnd,
          day: studentDay,
        } = studentDoc.data();

        if (studentDay !== limitDay) continue;

        const studentStartChange = changeStringToTime(studentStart);
        const studentEndChange = changeStringToTime(studentEnd);

        // 겹치는 시간이 있으면 카운트 증가
        if (
          (limitStartChange <= studentStartChange &&
            studentStartChange < limitEndChange) ||
          (limitStartChange < studentEndChange &&
            studentEndChange <= limitEndChange)
        ) {
          count++;
        }
      }

      // 신청할 수 없는 시간대가 있는지 확인
      console.log(count, limitNum);
      const overlapStart = changeStringToTime(startTime);
      const overlapEnd = changeStringToTime(endTime);

      console.log("limit", limitStartChange, limitEndChange);
      console.log("overlap", overlapStart, overlapEnd);
      console.log("count", count);

      if (count < limitNum) {
        return true;
      } else {
        return false;
      }
    }
  }

  return true;
};

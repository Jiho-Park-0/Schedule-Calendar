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
      day: limitDay, // Renamed to avoid confusion
    } = limitDoc.data();

    // Check if the current day matches the limit day
    if (day !== limitDay) continue; // Skip if days do not match

    console.log(limitStart, limitEnd, limitNum);
    const limitStartTime = new Date(`1970-01-01T${limitStart}:00`);
    const limitEndTime = new Date(`1970-01-01T${limitEnd}:00`);
    const newStartTime = new Date(`1970-01-01T${startTime}:00`);
    const newEndTime = new Date(`1970-01-01T${endTime}:00`);

    // Check if the new schedule overlaps with the limit time
    if (newStartTime < limitEndTime && newEndTime > limitStartTime) {
      let count = 0;
      for (const studentDoc of studentSnapshot.docs) {
        const { startTime: studentStart, endTime: studentEnd } =
          studentDoc.data();
        const studentStartTime = new Date(`1970-01-01T${studentStart}:00`);
        const studentEndTime = new Date(`1970-01-01T${studentEnd}:00`);

        // Count overlapping student schedules
        if (
          studentStartTime < limitEndTime &&
          studentEndTime > limitStartTime
        ) {
          count++;
        }
      }
      // Check if the count exceeds the limit
      if (count >= limitNum) {
        return false; // Limit exceeded
      }
    }
  }
  return true; // No limit exceeded
};

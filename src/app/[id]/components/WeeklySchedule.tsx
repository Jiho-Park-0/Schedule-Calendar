import { Button, Typography } from "antd";

const { Title } = Typography;

interface Schedule {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  day: string;
  backgroundColor: string;
  password: string;
}

interface WeeklyScheduleProps {
  weekDays: string[];
  timeSlots: string[];
  scheduleData: Schedule[];
  onAddClassClick: (day: string) => void;
  onEditClassClick: (schedule: Schedule) => void;
}

const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({
  weekDays,
  timeSlots,
  scheduleData,
  onAddClassClick,
  onEditClassClick,
}) => {
  const calculateTopPosition = (startTime: string) => {
    const [hour, minute] = startTime.split(":").map(Number);
    return (((hour - 10) * 2 + (minute === 30 ? 1 : 0)) * 100) / 27;
  };

  const calculateHeight = (startTime: string, endTime: string) => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;
    return (((end - start) / 30) * 100) / 27;
  };

  const calculateLeftPosition = (
    schedules: Schedule[],
    currentSchedule: Schedule
  ) => {
    let leftPosition = 0;
    for (let i = 0; i < schedules.length; i++) {
      const schedule = schedules[i];
      if (
        currentSchedule.startTime < schedule.endTime &&
        currentSchedule.endTime > schedule.startTime
      ) {
        leftPosition += 20; // 겹치는 경우 left 값을 증가시킴
      }
    }
    return leftPosition;
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 md:p-6 items-center justify-center min-w-max w-full">
      <div className="flex justify-center items-center mb-4">
        <Title level={2} className="text-lg md:text-xl lg:text-2xl text-center">
          주간 시간표
        </Title>
      </div>
      <div className="flex flex-row">
        <div className="flex flex-col mt-16">
          {timeSlots.map((time, index) => (
            <div key={index} className="h-[100px] w-16 border-b text-center">
              {time}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 w-full">
          {weekDays.map((day, index) => {
            const schedulesInDay = scheduleData.filter(
              (schedule) => schedule.day === day
            );
            return (
              <div
                key={index}
                className="max-w-full border-l flex-1 items-center justify-center min-w-[190px]"
              >
                <div className="text-center mb-2 flex flex-col justify-center items-center">
                  <div className="font-semibold text-sm md:text-base min-w-[100px]">
                    {day}
                  </div>
                  <Button
                    size="small"
                    className="w-20 mb-2"
                    onClick={() => onAddClassClick(day)}
                  >
                    추가
                  </Button>
                </div>

                <div className="relative h-[2700px] w-[160px] flex flex-col m-2">
                  {schedulesInDay.map((schedule, idx) => (
                    <div
                      key={idx}
                      className="absolute p-1 rounded flex justify-center items-center cursor-pointer hover:opacity-80 active:opacity-60"
                      style={{
                        top: `${calculateTopPosition(schedule.startTime)}%`,
                        height: `${calculateHeight(
                          schedule.startTime,
                          schedule.endTime
                        )}%`,
                        backgroundColor: schedule.backgroundColor,
                        width: `16px`,
                        left: `${calculateLeftPosition(
                          schedulesInDay.slice(0, idx),
                          schedule
                        )}px`,
                      }}
                      onClick={() => onEditClassClick(schedule)}
                    >
                      <span className="text-xs font-medium text-white">
                        {schedule.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeeklySchedule;

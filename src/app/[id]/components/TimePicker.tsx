import { Button } from "antd";
import { DownOutlined } from "@ant-design/icons";

interface TimePickerProps {
  startTime: string | null;
  endTime: string | null;
  onTimeSelect: (time: string) => void;
}

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour <= 23; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      slots.push(
        `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`
      );
    }
  }
  return slots;
};

const TimePicker: React.FC<TimePickerProps> = ({
  startTime,
  endTime,
  onTimeSelect,
}) => {
  const timeSlots = generateTimeSlots();

  return (
    <div>
      <Button type="text" icon={<DownOutlined />}>
        {startTime && endTime
          ? `${startTime} - ${endTime}`
          : startTime
          ? `${startTime} - 선택 중`
          : "시간 선택"}
      </Button>
      <div className="grid grid-cols-4 gap-2">
        {timeSlots.map((time) => (
          <Button
            key={time}
            type={
              time === startTime || time === endTime ? "primary" : "default"
            }
            onClick={() => onTimeSelect(time)}
          >
            {time}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TimePicker;

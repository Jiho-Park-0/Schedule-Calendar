"use client";

const CalendarPage = ({ params }: { params: { name: string } }) => {
  const { name } = params;

  return (
    <div>
      <div className="text-xl font-bold">{decodeURI(name)} 선생님의 시간표</div>
    </div>
  );
};

export default CalendarPage;

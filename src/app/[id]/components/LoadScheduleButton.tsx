"use client";

import { Button } from "antd";

interface LoadScheduleButtonProps {
  onClick: () => void;
}

export default function LoadScheduleButton({
  onClick,
}: LoadScheduleButtonProps) {
  return <Button onClick={onClick}>시간표 불러오기</Button>;
}

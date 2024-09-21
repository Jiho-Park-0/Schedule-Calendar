"use client";

import { Button } from "antd";

interface DeleteScheduleButtonProps {
  onClick: () => void;
}

export default function DeleteScheduleButton({
  onClick,
}: DeleteScheduleButtonProps) {
  return <Button onClick={onClick}>시간표 삭제</Button>;
}

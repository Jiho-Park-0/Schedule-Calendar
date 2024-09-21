"use client";

import { Button } from "antd";

interface DeleteClassButtonProps {
  onClick: () => void;
}

export default function DeleteClassButton({ onClick }: DeleteClassButtonProps) {
  return (
    <Button danger onClick={onClick}>
      반 삭제
    </Button>
  );
}

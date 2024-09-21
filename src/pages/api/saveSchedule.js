// pages/api/save-json.js
import { promises as fs } from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // JSON 데이터를 받아옵니다
      const { id, data } = req.body;

      // 파일 경로를 지정 (public 디렉토리 하위에 저장)
      const filePath = path.join(process.cwd(), "public", `${id}.json`);

      // JSON 데이터를 파일로 저장
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));

      res.status(200).json({ message: "JSON file created successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error creating JSON file" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}

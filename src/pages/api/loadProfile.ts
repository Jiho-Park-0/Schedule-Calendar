import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { teacherId } = req.query;

    const filePath = path.join(process.cwd(), "public", "profile.json");

    const fileData = fs.readFileSync(filePath, "utf8");
    const profiles = JSON.parse(fileData);

    const profile = profiles.find(
      (p: { id: number }) => p.id === parseInt(teacherId as string, 10)
    );

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    return res.status(200).json(profile);
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}

import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { teacherId, formattedPath, action } = req.body;

      const profilePath = path.resolve(process.cwd(), "public/profile.json");
      const profiles: { id: number; "시간표 리스트": string[] }[] = JSON.parse(
        fs.readFileSync(profilePath, "utf-8")
      );

      profiles.forEach((profile) => {
        if (profile.id === parseInt(teacherId, 10)) {
          if (action === "delete") {
            const index = profile["시간표 리스트"].indexOf(formattedPath);
            if (index > -1) {
              profile["시간표 리스트"].splice(index, 1);
            }
          } else {
            if (!profile["시간표 리스트"].includes(formattedPath)) {
              profile["시간표 리스트"].push(formattedPath);
            }
          }
        }
      });

      fs.writeFileSync(profilePath, JSON.stringify(profiles, null, 2), "utf-8");

      res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

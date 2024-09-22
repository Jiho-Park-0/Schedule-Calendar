import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const newProfile = req.body;

    const filePath = path.join(process.cwd(), "public", "profile.json");
    const fileContents = fs.readFileSync(filePath, "utf8");
    const profiles = JSON.parse(fileContents);

    profiles.push(newProfile);

    fs.writeFileSync(filePath, JSON.stringify(profiles, null, 2));

    res.status(200).json({ message: "Profile updated successfully" });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

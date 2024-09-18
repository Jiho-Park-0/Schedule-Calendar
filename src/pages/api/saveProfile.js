import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method === "POST") {
    const filePath = path.resolve("public", "profile.json");
    const newProfile = req.body;

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        return res.status(500).json({ error: "Error reading profile data" });
      }

      const profiles = JSON.parse(data);
      profiles.push(newProfile);

      fs.writeFile(filePath, JSON.stringify(profiles, null, 2), (err) => {
        if (err) {
          return res.status(500).json({ error: "Error saving profile data" });
        }

        res.status(200).json({ message: "Profile saved successfully" });
      });
    });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

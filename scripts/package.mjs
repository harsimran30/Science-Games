// Turns the single-file build into the things people actually open.
import { mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";

const html = readFileSync("dist/index.html", "utf8");
rmSync("release", { recursive: true, force: true });
mkdirSync("release/ScienceQuest", { recursive: true });

// The app plus a Windows launcher that opens it in its own window (no tabs, no address bar).
writeFileSync("release/ScienceQuest/ScienceQuest.html", html);
writeFileSync(
  "release/ScienceQuest/Start Science Quest.cmd",
  ['@echo off', 'rem Opens Science Quest in its own window using Microsoft Edge (built into Windows 10 and 11).',
   'set "APP=%~dp0ScienceQuest.html"', 'start "" msedge --app="file:///%APP:\\=/%" --window-size=1100,820',
   'if errorlevel 1 start "" "%APP%"', ''].join("\r\n"),
);
writeFileSync(
  "release/ScienceQuest/README.txt",
  ["Science Quest", "", "Windows: double-click 'Start Science Quest.cmd'. It opens in its own window.",
   "If that does nothing, double-click ScienceQuest.html to open it in your browser instead.",
   "iPad or any other device: put ScienceQuest.html on any web host and open the link in Safari, then Share > Add to Home Screen.",
   "", "Progress (XP and levels) is saved on the device you play on. Keep both files in the same folder.", ""].join("\r\n"),
);
console.log("release/ ready:", (html.length / 1024).toFixed(0) + " KB");

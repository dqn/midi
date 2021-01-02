import fs from "fs/promises";

import { printUint8Array } from "./helpers/array";
import { makeMIDI } from "./midi";
import { parseMusicInfo } from "./parser";

function main() {
  // prettier-ignore
  const midiInfo = parseMusicInfo({
    bpm: 120,
    channels: [0, 1, 2, 3],
    score: [
      {
        notes: [
          "C4 D4 E4 F4",
        ],
      },
      {
        notes: [
          "E4 D4 C4 . ",
        ],
      },
      {
        notes: [
          "E4 F4 G4 A4",
          "C4 D4 E4 F4",
        ],
      },
      {
        notes: [
          "G4 F4 E4 . ",
          "E4 D4 C4 . ",
        ],
      },
      {
        notes: [
          "C4 .  C4 . ",
          "E4 F4 G4 A4",
          "C4 D4 E4 F4",
        ],
      },
      {
        notes: [
          "C4 .  C4 . ",
          "G4 F4 E4 . ",
          "E4 D4 C4 . ",
        ],
      },
      {
        notes: [
          "C4 C4 D4 D4 E4 E4 F4 F4",
          "C4    .     C4    .    ",
          "E4    F4    G4    A4   ",
          "C4    D4    E4    F4   ",
        ],
      },
      {
        notes: [
          "E4 D4 C4 . ",
          "C4 .  C4 . ",
          "G4 F4 E4 . ",
          "E4 D4 C4 . ",
      ],
      },
      {
        notes: [
          "C4 C4 D4 D4 E4 E4 F4 F4",
          "C4    .    C4    .     ",
          "E4    F4    G4    A4   ",
        ],
      },
      {
        notes: [
          "E4 D4 C4 . ",
          "C4 .  C4 . ",
          "G4 F4 E4 . ",
        ],
      },
      {
        notes: [
          "C4 C4 D4 D4 E4 E4 F4 F4",
          "C4    .     C4    .    ",
        ],
      },
      {
        notes: [
          "E4 D4 C4 . ",
          "C4 .  C4 . ",
        ],
      },
      {
        notes: [
          "C4 C4 D4 D4 E4 E4 F4 F4",
        ],
      },
      {
        notes: [
          "E4 D4 C4 . ",
        ],
      },
    ],
  });

  console.log(JSON.stringify(midiInfo));
  const buf = makeMIDI(midiInfo);

  printUint8Array(buf);
  fs.writeFile("./sample.mid", buf).catch(console.error);
}

main();

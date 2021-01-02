import fs from "fs/promises";

import { printUint8Array } from "./helpers/array";
import { makeMIDI } from "./midi";
import { parseMusicInfo } from "./parser";

async function main() {
  const midiInfo = parseMusicInfo({
    bpm: 240,
    score: [
      [{ channelNumber: 0, notes: ["C4", "D4", "E4", ""] }],
      [{ channelNumber: 0, notes: ["C4", "D4", "E4", ""] }],
      [{ channelNumber: 0, notes: ["G4", "E4", "D4", "C4"] }],
      [{ channelNumber: 0, notes: ["D4", "E4", "D4", ""] }],
    ],
  });

  console.log(JSON.stringify(midiInfo));
  const buf1 = makeMIDI(midiInfo);
  printUint8Array(buf1);
  fs.writeFile("./sample.mid", buf1);
  return;

  const buf = makeMIDI({
    division: 960,
    trackChunkInfos: [
      {
        trackEventInfos: [
          { deltaTime: 0, metaType: "copyright-notice", data: "" },
          {
            deltaTime: 0,
            metaType: "sequence-or-track-name",
            data: "2020-12-31_5-44-1_-1251694062",
          },
          {
            deltaTime: 0,
            metaType: "tempo-setting",
            tempo: 500_000,
          },
        ],
      },
      {
        trackEventInfos: [
          {
            deltaTime: 0,
            metaType: "sequence-or-track-name",
            data: "",
          },
          {
            deltaTime: 0,
            channelNumber: 0,
            noteNumber: 60,
            midiChannelMessage: "note-on",
            velocity: 100,
          },
          {
            deltaTime: 960,
            channelNumber: 0,
            noteNumber: 60,
            midiChannelMessage: "note-off",
            velocity: 0,
          },
          {
            deltaTime: 0,
            channelNumber: 0,
            noteNumber: 62,
            midiChannelMessage: "note-on",
            velocity: 100,
          },
          {
            deltaTime: 960,
            channelNumber: 0,
            noteNumber: 62,
            midiChannelMessage: "note-off",
            velocity: 0,
          },
          {
            deltaTime: 0,
            channelNumber: 0,
            noteNumber: 64,
            midiChannelMessage: "note-on",
            velocity: 100,
          },
          {
            deltaTime: 960,
            channelNumber: 0,
            noteNumber: 64,
            midiChannelMessage: "note-off",
            velocity: 0,
          },
          {
            deltaTime: 960,
            channelNumber: 0,
            noteNumber: 60,
            midiChannelMessage: "note-on",
            velocity: 100,
          },
          {
            deltaTime: 960,
            channelNumber: 0,
            noteNumber: 60,
            midiChannelMessage: "note-off",
            velocity: 0,
          },
          {
            deltaTime: 0,
            channelNumber: 0,
            noteNumber: 62,
            midiChannelMessage: "note-on",
            velocity: 100,
          },
          {
            deltaTime: 960,
            channelNumber: 0,
            noteNumber: 62,
            midiChannelMessage: "note-off",
            velocity: 0,
          },
          {
            deltaTime: 0,
            channelNumber: 0,
            noteNumber: 64,
            midiChannelMessage: "note-on",
            velocity: 100,
          },
          {
            deltaTime: 960,
            channelNumber: 0,
            noteNumber: 64,
            midiChannelMessage: "note-off",
            velocity: 0,
          },
          {
            deltaTime: 960,
            channelNumber: 0,
            noteNumber: 67,
            midiChannelMessage: "note-on",
            velocity: 100,
          },
          {
            deltaTime: 960,
            channelNumber: 0,
            noteNumber: 67,
            midiChannelMessage: "note-off",
            velocity: 0,
          },
          {
            deltaTime: 0,
            channelNumber: 0,
            noteNumber: 64,
            midiChannelMessage: "note-on",
            velocity: 100,
          },
          {
            deltaTime: 960,
            channelNumber: 0,
            noteNumber: 64,
            midiChannelMessage: "note-off",
            velocity: 0,
          },
          {
            deltaTime: 0,
            channelNumber: 0,
            noteNumber: 62,
            midiChannelMessage: "note-on",
            velocity: 100,
          },
          {
            deltaTime: 960,
            channelNumber: 0,
            noteNumber: 62,
            midiChannelMessage: "note-off",
            velocity: 0,
          },
          {
            deltaTime: 0,
            channelNumber: 0,
            noteNumber: 60,
            midiChannelMessage: "note-on",
            velocity: 100,
          },
          {
            deltaTime: 960,
            channelNumber: 0,
            noteNumber: 60,
            midiChannelMessage: "note-off",
            velocity: 0,
          },
          {
            deltaTime: 0,
            channelNumber: 0,
            noteNumber: 62,
            midiChannelMessage: "note-on",
            velocity: 100,
          },
          {
            deltaTime: 960,
            channelNumber: 0,
            noteNumber: 62,
            midiChannelMessage: "note-off",
            velocity: 0,
          },
          {
            deltaTime: 0,
            channelNumber: 0,
            noteNumber: 64,
            midiChannelMessage: "note-on",
            velocity: 100,
          },
          {
            deltaTime: 960,
            channelNumber: 0,
            noteNumber: 64,
            midiChannelMessage: "note-off",
            velocity: 0,
          },
          {
            deltaTime: 0,
            channelNumber: 0,
            noteNumber: 62,
            midiChannelMessage: "note-on",
            velocity: 100,
          },
          {
            deltaTime: 960,
            channelNumber: 0,
            noteNumber: 62,
            midiChannelMessage: "note-off",
            velocity: 0,
          },
        ],
      },
    ],
  });

  printUint8Array(buf);

  fs.writeFile("./sample.mid", buf);
}

main().catch(console.error);

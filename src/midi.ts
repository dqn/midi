import fs from "fs/promises";

function printUint8Array(buf: Uint8Array) {
  console.log(
    Array.from(buf)
      .map((b) => b.toString(16))
      .join(","),
  );
}

function numberToUint8Array(n: number, padding: number = 0): Uint8Array {
  if (!n) {
    return new Uint8Array([0]);
  }

  const arr: number[] = [];

  while (n) {
    arr.push(n & 0xff);
    n >>= 8;
  }

  while (arr.length < padding) {
    arr.push(0);
  }

  return new Uint8Array(arr.reverse());
}

function numberToVariableLengthValue(n: number): Uint8Array {
  if (!n) {
    return new Uint8Array([0]);
  }

  const arr: number[] = [];

  while (n) {
    arr.push((n & 0x7f) | (arr.length ? 0x80 : 0));
    n >>= 7;
  }

  return new Uint8Array(arr.reverse());
}

function stringToCharCodeArray(s: string): Uint8Array {
  return new Uint8Array(s.split("").map((c) => c.charCodeAt(0)));
}

const midiChannelMessageIds = {
  "note-off": 0x80,
  "note-on": 0x90,
} as const;

const metaTypeIds = {
  // "sequence-number": 0x00,
  // "text-event": 0x01,
  "copyright-notice": 0x02,
  "sequence-or-track-name": 0x03,
  // "instrument-name": 0x04,
  // "lyric-text": 0x05,
  // "marker-text": 0x06,
  // "cue-point": 0x07,
  // "midi-channel-prefix-assignment": 0x20,
  // "end-of-track": 0x2f,
  // "tempo-setting": 0x51,
  // "smpte-offset": 0x54,
  // "time-signature": 0x58,
  // "key-signature": 0x59,
  // "sequencer-specific-event": 0x7f,
} as const;

type MIDIEventInfo = {
  midiChannelMessage: keyof typeof midiChannelMessageIds;
  channelNumber: number;
  noteNumber: number;
  velocity: number;
};

type MetaEventInfo =
  | {
      metaType: keyof typeof metaTypeIds;
      data: string;
    }
  | {
      metaType: "tempo-setting";
      tempo: number;
    };

type TrackEventInfo = { deltaTime: number } & (MIDIEventInfo | MetaEventInfo);

function makeTrackEvent(trackEventInfo: TrackEventInfo): Uint8Array {
  let contents: Uint8Array = new Uint8Array();
  if ("midiChannelMessage" in trackEventInfo) {
    contents = new Uint8Array([
      midiChannelMessageIds[trackEventInfo.midiChannelMessage] |
        trackEventInfo.channelNumber,
      trackEventInfo.noteNumber,
      trackEventInfo.velocity,
    ]);
  } else if ("metaType" in trackEventInfo) {
    if ("tempo-setting" === trackEventInfo.metaType) {
      const tempo = numberToUint8Array(trackEventInfo.tempo);
      contents = new Uint8Array([
        0xff,
        0x51,
        ...numberToUint8Array(tempo.length),
        ...tempo,
      ]);
    } else {
      const data = stringToCharCodeArray(trackEventInfo.data);
      contents = new Uint8Array([
        0xff,
        metaTypeIds[trackEventInfo.metaType],
        ...numberToVariableLengthValue(data.length),
        ...data,
      ]);
    }
  }

  return new Uint8Array([
    ...numberToVariableLengthValue(trackEventInfo.deltaTime),
    ...contents,
  ]);
}

type TrackChunkInfo = {
  trackEventInfos: TrackEventInfo[];
};

function makeTrackChunk(trackChunkInfo: TrackChunkInfo): Uint8Array {
  const events = trackChunkInfo.trackEventInfos
    .flatMap((event) => Array.from(makeTrackEvent(event)))
    .concat([
      0x00,
      0xff, // End of Track
      0x2f,
      0x00,
    ]);

  return new Uint8Array([
    0x4d, // MTrk
    0x54,
    0x72,
    0x6b,

    // the number of bytes in the track chunk
    ...numberToUint8Array(events.length, 4),

    // events
    ...events,
  ]);
}

type MIDIInfo = {
  division: number;
  trackChunkInfos: TrackChunkInfo[];
};

function makeMIDI(info: MIDIInfo): Uint8Array {
  const trackChunks = info.trackChunkInfos.flatMap((info) =>
    Array.from(makeTrackChunk(info)),
  );

  return new Uint8Array([
    //
    // Header Chunk
    //

    0x4d, // MThd
    0x54,
    0x68,
    0x64,

    0x00, // header length (6 byte)
    0x00,
    0x00,
    0x06,

    0x00, // format 1 (multiple track file format)
    0x01,

    // number of track chunks
    ...numberToUint8Array(info.trackChunkInfos.length, 2),

    // division (unit of time for delta timing)
    ...numberToUint8Array(info.division, 2),

    // track chunks
    ...trackChunks,
  ]);
}

async function main() {
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

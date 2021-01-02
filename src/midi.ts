import {
  numberToUint8Array,
  numberToVariableLengthValue,
  stringToCharCodeArray,
} from "./helpers/array";

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

export type MIDIEventInfo = {
  midiChannelMessage: keyof typeof midiChannelMessageIds;
  channelNumber: number;
  noteNumber: number;
  velocity: number;
};

export type MetaEventInfo =
  | {
      metaType: keyof typeof metaTypeIds;
      data: string;
    }
  | {
      metaType: "tempo-setting";
      tempo: number;
    };

export type TrackEventInfo = { deltaTime: number } & (
  | MIDIEventInfo
  | MetaEventInfo
);

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

export type TrackChunkInfo = {
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

export type MIDIInfo = {
  division: number;
  trackChunkInfos: TrackChunkInfo[];
};

export function makeMIDI(midiInfo: MIDIInfo): Uint8Array {
  const trackChunks = midiInfo.trackChunkInfos.flatMap((info) =>
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
    ...numberToUint8Array(midiInfo.trackChunkInfos.length, 2),

    // division (unit of time for delta timing)
    ...numberToUint8Array(midiInfo.division, 2),

    // track chunks
    ...trackChunks,
  ]);
}

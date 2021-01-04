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

export type MIDIEvent = {
  midiChannelMessage: keyof typeof midiChannelMessageIds;
  channelNumber: number;
  noteNumber: number;
  velocity: number;
};

export type MetaEvent =
  | {
      metaType: keyof typeof metaTypeIds;
      data: string;
    }
  | {
      metaType: "tempo-setting";
      tempo: number;
    };

export type TrackEvent = { deltaTime: number } & (MIDIEvent | MetaEvent);

function makeTrackEvent(trackEvent: TrackEvent): Uint8Array {
  let contents: Uint8Array = new Uint8Array();
  if ("midiChannelMessage" in trackEvent) {
    contents = new Uint8Array([
      midiChannelMessageIds[trackEvent.midiChannelMessage] |
        trackEvent.channelNumber,
      trackEvent.noteNumber,
      trackEvent.velocity,
    ]);
  } else if ("metaType" in trackEvent) {
    if ("tempo-setting" === trackEvent.metaType) {
      const tempo = numberToUint8Array(trackEvent.tempo);
      contents = new Uint8Array([
        0xff,
        0x51,
        ...numberToUint8Array(tempo.length),
        ...tempo,
      ]);
    } else {
      const data = stringToCharCodeArray(trackEvent.data);
      contents = new Uint8Array([
        0xff,
        metaTypeIds[trackEvent.metaType],
        ...numberToVariableLengthValue(data.length),
        ...data,
      ]);
    }
  }

  return new Uint8Array([
    ...numberToVariableLengthValue(trackEvent.deltaTime),
    ...contents,
  ]);
}

export type TrackChunk = {
  trackEvents: TrackEvent[];
};

function makeTrackChunk(trackChunk: TrackChunk): Uint8Array {
  const events = trackChunk.trackEvents
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

export type MIDI = {
  division: number;
  trackChunks: TrackChunk[];
};

export function generateMIDI(midi: MIDI): Uint8Array {
  const trackChunks = midi.trackChunks.flatMap((chunk) =>
    Array.from(makeTrackChunk(chunk)),
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
    ...numberToUint8Array(midi.trackChunks.length, 2),

    // division (unit of time for delta timing)
    ...numberToUint8Array(midi.division, 2),

    // track chunks
    ...trackChunks,
  ]);
}

import { MIDIEvent, MIDI, TrackEvent } from "./midi";
import { noteNumbers } from "./note";

const noteCommands = [
  ...(Object.keys(noteNumbers) as (keyof typeof noteNumbers)[]),
  ".",
  "-",
] as const;

type NoteCommand = typeof noteCommands[number];

export type Bar = {
  notes: string[];
};

export type MusicData = {
  bpm: number;
  channels: number[];
  score: Bar[];
};

function assertIsNoteCommandArray(x: any[]): asserts x is NoteCommand[] {
  const v = x.find((c) => !noteCommands.includes(c));
  if (v) {
    throw new Error(`unknown note command "${v}"`);
  }
}

export function parseMusicData(musicData: MusicData): MIDI {
  const metaTrackEvents: TrackEvent[] = [
    {
      deltaTime: 0,
      metaType: "tempo-setting",
      tempo: (1_000_000 * 60) / musicData.bpm,
    },
  ];

  const division = 960;
  const measure = 4 / 4;

  type AbsooluteTrackTimeEvent = MIDIEvent & { time: number };
  const absoluteTimeTrackEvents: AbsooluteTrackTimeEvent[] = musicData.channels.flatMap(
    (channelNumber, channelIndex) => {
      let offEvent: null | AbsooluteTrackTimeEvent = null;

      const events = musicData.score.flatMap((bar, barIndex) => {
        const barChannel = bar.notes[channelIndex];
        if (!barChannel) {
          return [];
        }

        const barNotes = barChannel.split(/\s+/).filter((note) => note);
        assertIsNoteCommandArray(barNotes);

        const barLength = division * 4 * measure;
        const span = barLength / barNotes.length;

        return barNotes.flatMap((note, noteIndex) => {
          if (note === "-") {
            offEvent!.time += span;
            return [];
          }

          if (note === ".") {
            if (offEvent) {
              const event = { ...offEvent };
              offEvent = null;
              return event;
            } else {
              return [];
            }
          }

          const events: AbsooluteTrackTimeEvent[] = [];

          if (offEvent) {
            events.push(offEvent);
          }

          offEvent = {
            time: barLength * barIndex + span * (noteIndex + 1),
            channelNumber,
            noteNumber: noteNumbers[note],
            midiChannelMessage: "note-off",
            velocity: 0,
          };

          events.push({
            time: barLength * barIndex + span * noteIndex,
            channelNumber,
            noteNumber: noteNumbers[note],
            midiChannelMessage: "note-on",
            velocity: 127,
          });

          return events;
        });
      });

      if (offEvent) {
        events.push(offEvent);
      }

      return events;
    },
  );

  absoluteTimeTrackEvents.sort((a, b) => a.time - b.time);

  let prevTime = 0;
  const mainTrackEvents = absoluteTimeTrackEvents.map(({ time, ...props }) => {
    const deltaTime = time - prevTime;
    prevTime = time;
    return { deltaTime, ...props };
  });

  return {
    division,
    trackChunks: [
      { trackEvents: metaTrackEvents },
      { trackEvents: mainTrackEvents },
    ],
  };
}

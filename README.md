# midi

[![CI](https://github.com/dqn/midi/workflows/CI/badge.svg)](https://github.com/dqn/midi/actions)

[WIP] Text-based MIDI generator.

## Example

```ts
import { generate } from "@dqn/midi";
import fs from "fs/promises";

// prettier-ignore
const buf = generate({
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

fs.writeFile("./sample.mid", buf);
```

## License

MIT

import { generateMIDI } from "./midi";
import { MusicData, parseMusicData } from "./parser";

export function generate(musidData: MusicData): Uint8Array {
  return generateMIDI(parseMusicData(musidData));
}

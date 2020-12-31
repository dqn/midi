export function printUint8Array(buf: Uint8Array) {
  console.log(
    Array.from(buf)
      .map((b) => b.toString(16))
      .join(","),
  );
}

export function numberToUint8Array(n: number, padding: number = 0): Uint8Array {
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

export function numberToVariableLengthValue(n: number): Uint8Array {
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

export function stringToCharCodeArray(s: string): Uint8Array {
  return new Uint8Array(s.split("").map((c) => c.charCodeAt(0)));
}

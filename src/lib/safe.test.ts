import { describe, it, expect } from "vitest";
import { asArray, asObject } from "./safe";

describe("asArray", () => {
  it("passes a real array through untouched", () => {
    const input = [1, 2, 3];
    expect(asArray<number>(input)).toBe(input);
  });

  it("turns the shapes that crashed the app into an empty list", () => {
    // Each of these previously reached a `.filter()` or `.length` and took
    // down the whole screen.
    expect(asArray(undefined)).toEqual([]);
    expect(asArray(null)).toEqual([]);
    expect(asArray({})).toEqual([]);
    expect(asArray({ challenges: [] })).toEqual([]);
    expect(asArray("nope")).toEqual([]);
    expect(asArray(0)).toEqual([]);
  });

  it("keeps an empty array distinct from a missing one only by value", () => {
    expect(asArray([])).toEqual([]);
  });
});

describe("asObject", () => {
  it("passes a plain object through", () => {
    const o = { a: 1 };
    expect(asObject(o)).toBe(o);
  });

  it("rejects arrays, which are objects but never the intended shape", () => {
    expect(asObject([])).toBeNull();
  });

  it("rejects nullish and primitives", () => {
    expect(asObject(null)).toBeNull();
    expect(asObject(undefined)).toBeNull();
    expect(asObject("x")).toBeNull();
    expect(asObject(3)).toBeNull();
  });
});

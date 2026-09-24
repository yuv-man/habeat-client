import { describe, it, expect } from "vitest";
import { isPersonalKey, isProjectKey } from "./posthogKey";

describe("PostHog key guard", () => {
  it("accepts a project key only", () => {
    expect(isProjectKey("phc_abc123")).toBe(true);
    expect(isProjectKey("phx_abc123")).toBe(false);
    expect(isProjectKey("")).toBe(false);
    expect(isProjectKey(undefined)).toBe(false);
  });

  it("recognises a personal key", () => {
    expect(isPersonalKey("phx_abc123")).toBe(true);
    expect(isPersonalKey(" phx_abc123")).toBe(true);
    expect(isPersonalKey("phc_abc123")).toBe(false);
  });
});

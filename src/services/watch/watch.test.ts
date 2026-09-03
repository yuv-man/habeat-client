import { beforeEach, describe, expect, it, vi } from "vitest";
import { Health } from "@flomentumsolutions/capacitor-health-extended";
import type { PermissionResponse } from "@flomentumsolutions/capacitor-health-extended";
import { HealthConnectProvider } from "./HealthConnectProvider";
import {
  deriveStressLevel,
  deriveSleepQuality,
  evaluatePermissions,
  REQUIRED_PERMISSIONS as REQUIRED,
} from "./types";

vi.mock("@flomentumsolutions/capacitor-health-extended", () => ({
  Health: {
    requestHealthPermissions: vi.fn(),
    checkHealthPermissions: vi.fn(),
  },
}));

const REQUIRED_PERMISSIONS = [
  "READ_HEART_RATE",
  "READ_RESTING_HEART_RATE",
  "READ_HRV",
  "READ_SLEEP",
  "READ_STEPS",
] as const;

function permissionsResponse(granted: boolean): PermissionResponse {
  return {
    permissions: Object.fromEntries(
      REQUIRED_PERMISSIONS.map((permission) => [permission, granted]),
    ) as PermissionResponse["permissions"],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("deriveStressLevel", () => {
  it("returns 'high' for HRV below 20ms", () => {
    expect(deriveStressLevel(0)).toBe("high");
    expect(deriveStressLevel(10)).toBe("high");
    expect(deriveStressLevel(19)).toBe("high");
  });

  it("returns 'moderate' for HRV between 20 and 50ms inclusive", () => {
    expect(deriveStressLevel(20)).toBe("moderate");
    expect(deriveStressLevel(35)).toBe("moderate");
    expect(deriveStressLevel(50)).toBe("moderate");
  });

  it("returns 'low' for HRV above 50ms", () => {
    expect(deriveStressLevel(51)).toBe("low");
    expect(deriveStressLevel(80)).toBe("low");
    expect(deriveStressLevel(150)).toBe("low");
  });
});

describe("deriveSleepQuality", () => {
  it("returns 'poor' for sleep under 6 hours", () => {
    expect(deriveSleepQuality(0)).toBe("poor");
    expect(deriveSleepQuality(4)).toBe("poor");
    expect(deriveSleepQuality(5.9)).toBe("poor");
  });

  it("returns 'fair' for sleep between 6 and 7 hours inclusive", () => {
    expect(deriveSleepQuality(6)).toBe("fair");
    expect(deriveSleepQuality(6.5)).toBe("fair");
    expect(deriveSleepQuality(7)).toBe("fair");
  });

  it("returns 'good' for sleep over 7 hours", () => {
    expect(deriveSleepQuality(7.1)).toBe("good");
    expect(deriveSleepQuality(8)).toBe("good");
    expect(deriveSleepQuality(10)).toBe("good");
  });
});

describe("permission requirements", () => {
  it("treats only steps and heart rate as required", () => {
    // Everything else is optional on purpose: demanding all five meant one
    // declined type — usually HRV, which many devices never record — reported
    // the whole connection as denied.
    expect([...REQUIRED]).toEqual(["READ_STEPS", "READ_HEART_RATE"]);
  });

  it("connects when the required set is granted but optional types are not", () => {
    const state = evaluatePermissions({
      READ_STEPS: true,
      READ_HEART_RATE: true,
      READ_HRV: false,
      READ_SLEEP: false,
      READ_RESTING_HEART_RATE: false,
    });
    expect(state.connected).toBe(true);
    expect(state.missingOptional).toEqual([
      "READ_RESTING_HEART_RATE",
      "READ_HRV",
      "READ_SLEEP",
    ]);
  });

  it("does not connect when a required permission is missing", () => {
    expect(evaluatePermissions({ READ_STEPS: true, READ_HEART_RATE: false }).connected).toBe(false);
    expect(evaluatePermissions({}).connected).toBe(false);
    expect(evaluatePermissions(undefined).connected).toBe(false);
  });
});

describe("HealthConnectProvider", () => {
  it("connects when every permission is granted", async () => {
    vi.mocked(Health.requestHealthPermissions).mockResolvedValue(permissionsResponse(true));

    const state = await new HealthConnectProvider().requestPermissions();
    expect(state.connected).toBe(true);
    expect(state.missingOptional).toEqual([]);
  });

  it("still connects when only an OPTIONAL permission is denied", async () => {
    // Regression guard: this exact case used to report the whole connection
    // as denied and then cache that refusal permanently.
    const permissions = permissionsResponse(true);
    permissions.permissions.READ_SLEEP = false;
    vi.mocked(Health.requestHealthPermissions).mockResolvedValue(permissions);

    const state = await new HealthConnectProvider().requestPermissions();
    expect(state.connected).toBe(true);
    expect(state.missingOptional).toEqual(["READ_SLEEP"]);
  });

  it("does not connect when a REQUIRED permission is denied", async () => {
    const permissions = permissionsResponse(true);
    permissions.permissions.READ_STEPS = false;
    vi.mocked(Health.requestHealthPermissions).mockResolvedValue(permissions);

    await expect(
      new HealthConnectProvider().requestPermissions(),
    ).resolves.toMatchObject({ connected: false });
  });

  it("reports disconnected instead of throwing when the platform errors", async () => {
    vi.mocked(Health.requestHealthPermissions).mockRejectedValue(new Error("no Health Connect"));

    await expect(
      new HealthConnectProvider().requestPermissions(),
    ).resolves.toMatchObject({ connected: false });
  });

  it("checkPermissions reads current state without prompting", async () => {
    vi.mocked(Health.checkHealthPermissions).mockResolvedValue(permissionsResponse(true));

    const state = await new HealthConnectProvider().checkPermissions();
    expect(state.connected).toBe(true);
    // The whole point: no permission dialog is triggered.
    expect(Health.requestHealthPermissions).not.toHaveBeenCalled();
  });
});

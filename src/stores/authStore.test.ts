import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  mockUser,
  mockPlan,
  mockLoginResponse,
  mockSignupResponse,
} from "@/test/mocks";

// Mock the API
const mockUserAPI = {
  login: vi.fn(),
  signup: vi.fn(),
  fetchUser: vi.fn(),
  updateUser: vi.fn(),
  oauthAuth: vi.fn(),
  initiateOAuth: vi.fn(),
  generateMealPlan: vi.fn(),
  updateMealInPlan: vi.fn(),
  updateFavorite: vi.fn(),
};

vi.mock("@/services/api", () => ({
  userAPI: mockUserAPI,
}));

vi.mock("@/services/config", () => ({
  default: { testFrontend: false },
}));

vi.mock("@/mocks/planMock", () => ({
  mockUser: { _id: "mock", name: "Mock" },
  mockPlan: { _id: "mock_plan" },
}));

// Store the original localStorage
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => localStorageMock.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageMock.store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageMock.store[key];
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {};
  }),
};

Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("AuthStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    // Reset the module to get fresh store instance
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("should login successfully and save token", async () => {
      mockUserAPI.login.mockResolvedValue("test_token_123");
      mockUserAPI.fetchUser.mockResolvedValue({
        user: mockUser,
        plan: mockPlan,
      });

      // Import fresh store
      const { useAuthStore } = await import("./authStore");
      const store = useAuthStore.getState();

      await store.login("test@example.com", "password123");

      expect(mockUserAPI.login).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "token",
        "test_token_123"
      );
    });

    it("should throw error on failed login", async () => {
      mockUserAPI.login.mockRejectedValue(new Error("Invalid credentials"));

      const { useAuthStore } = await import("./authStore");
      const store = useAuthStore.getState();

      await expect(store.login("test@example.com", "wrong")).rejects.toThrow(
        "Invalid credentials"
      );
    });
  });

  describe("signup", () => {
    it("should signup successfully and save token", async () => {
      mockUserAPI.signup.mockResolvedValue({
        user: mockUser,
        plan: mockPlan,
        token: "signup_token_123",
      });

      const { useAuthStore } = await import("./authStore");
      const store = useAuthStore.getState();

      await store.signup("test@example.com", "password123", mockUser);

      expect(mockUserAPI.signup).toHaveBeenCalledWith(
        "test@example.com",
        "password123",
        mockUser
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "token",
        "signup_token_123"
      );
    });
  });

  describe("logout", () => {
    it("should clear token and user data from localStorage", async () => {
      // Set up initial state
      localStorageMock.setItem("token", "test_token");
      localStorageMock.setItem("habeat_user", JSON.stringify(mockUser));
      localStorageMock.setItem("habeat_plan", JSON.stringify(mockPlan));

      const { useAuthStore } = await import("./authStore");
      const store = useAuthStore.getState();

      store.logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("habeat_user");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("habeat_plan");
    });
  });

  describe("fetchUser", () => {
    it("should fetch user and plan with valid token", async () => {
      mockUserAPI.fetchUser.mockResolvedValue({
        user: mockUser,
        plan: mockPlan,
      });

      const { useAuthStore } = await import("./authStore");
      const store = useAuthStore.getState();

      await store.fetchUser("valid_token");

      expect(mockUserAPI.fetchUser).toHaveBeenCalledWith("valid_token");
    });

    it("should logout on 401 error", async () => {
      const error401 = { response: { status: 401 }, message: "Unauthorized" };
      mockUserAPI.fetchUser.mockRejectedValue(error401);

      const { useAuthStore } = await import("./authStore");
      const store = useAuthStore.getState();

      await store.fetchUser("invalid_token");

      // Should call logout (which removes token)
      expect(localStorageMock.removeItem).toHaveBeenCalled();
    });

    it("should NOT logout on network error", async () => {
      const networkError = new Error("Network Error");
      mockUserAPI.fetchUser.mockRejectedValue(networkError);

      const { useAuthStore } = await import("./authStore");
      // Set token first
      useAuthStore.getState().setToken("existing_token");
      vi.clearAllMocks(); // Clear the setItem call from setToken

      await useAuthStore.getState().fetchUser("existing_token");

      // Should NOT have removed token (no logout on network error)
      expect(localStorageMock.removeItem).not.toHaveBeenCalledWith("token");
    });
  });

  describe("setToken", () => {
    it("should save token to localStorage when token is provided", async () => {
      const { useAuthStore } = await import("./authStore");
      const store = useAuthStore.getState();

      store.setToken("new_token_123");

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "token",
        "new_token_123"
      );
    });

    it("should remove token and user data when token is null", async () => {
      const { useAuthStore } = await import("./authStore");
      const store = useAuthStore.getState();

      store.setToken(null);

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("habeat_user");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("habeat_plan");
    });
  });

  describe("setUser", () => {
    it("should save user to localStorage", async () => {
      const { useAuthStore } = await import("./authStore");
      const store = useAuthStore.getState();

      store.setUser(mockUser);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "habeat_user",
        expect.stringContaining(mockUser._id)
      );
    });

    it("should remove user from localStorage when user is null", async () => {
      const { useAuthStore } = await import("./authStore");
      const store = useAuthStore.getState();

      store.setUser(null);

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("habeat_user");
    });
  });

  describe("setPlan", () => {
    it("should save plan to localStorage", async () => {
      const { useAuthStore } = await import("./authStore");
      const store = useAuthStore.getState();

      store.setPlan(mockPlan);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "habeat_plan",
        expect.stringContaining(mockPlan._id)
      );
    });

    it("should remove plan from localStorage when plan is null", async () => {
      const { useAuthStore } = await import("./authStore");
      const store = useAuthStore.getState();

      store.setPlan(null);

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("habeat_plan");
    });
  });

  describe("mealTimes", () => {
    it("should have default meal times on initialization", async () => {
      const { useAuthStore } = await import("./authStore");
      const store = useAuthStore.getState();

      expect(store.mealTimes).toEqual({
        breakfast: "08:00",
        lunch: "12:30",
        dinner: "19:00",
        snacks: "15:00",
      });
    });

    it("should load meal times from localStorage if available", async () => {
      const customMealTimes = {
        breakfast: "07:00",
        lunch: "13:00",
        dinner: "20:00",
        snacks: "16:00",
      };
      localStorageMock.store["habeat_meal_times"] =
        JSON.stringify(customMealTimes);

      const { useAuthStore } = await import("./authStore");
      const store = useAuthStore.getState();

      expect(store.mealTimes).toEqual(customMealTimes);
    });

    it("should update meal times and save to localStorage", async () => {
      const { useAuthStore } = await import("./authStore");

      useAuthStore.getState().setMealTimes({ breakfast: "09:00" });

      expect(useAuthStore.getState().mealTimes.breakfast).toBe("09:00");
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "habeat_meal_times",
        expect.stringContaining("09:00")
      );
    });

    it("should merge partial meal times with existing ones", async () => {
      const { useAuthStore } = await import("./authStore");

      // Update only breakfast
      useAuthStore.getState().setMealTimes({ breakfast: "07:30" });

      // Other times should remain default
      expect(useAuthStore.getState().mealTimes).toEqual({
        breakfast: "07:30",
        lunch: "12:30",
        dinner: "19:00",
        snacks: "15:00",
      });
    });

    it("should update multiple meal times at once", async () => {
      const { useAuthStore } = await import("./authStore");

      useAuthStore.getState().setMealTimes({
        breakfast: "06:00",
        dinner: "18:00",
      });

      const mealTimes = useAuthStore.getState().mealTimes;
      expect(mealTimes.breakfast).toBe("06:00");
      expect(mealTimes.dinner).toBe("18:00");
      expect(mealTimes.lunch).toBe("12:30"); // unchanged
      expect(mealTimes.snacks).toBe("15:00"); // unchanged
    });

    it("should persist meal times across store reloads", async () => {
      // First import and set
      const { useAuthStore: store1 } = await import("./authStore");
      store1.getState().setMealTimes({ lunch: "14:00" });

      // Verify it was saved
      expect(localStorageMock.store["habeat_meal_times"]).toContain("14:00");

      // Reset modules and reimport
      vi.resetModules();

      // Second import should load from localStorage
      const { useAuthStore: store2 } = await import("./authStore");
      expect(store2.getState().mealTimes.lunch).toBe("14:00");
    });
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/test/test-utils";
import DailyTracker from "./DailyTracker";
import { mockUser, mockPlan, mockNavigate } from "@/test/mocks";

// Mock react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock auth store with different states
const mockAuthState = {
  user: null as typeof mockUser | null,
  plan: null as typeof mockPlan | null,
  loading: false,
  token: null as string | null,
};

vi.mock("@/stores/authStore", () => ({
  useAuthStore: () => mockAuthState,
}));

// Mock child components
vi.mock("@/components/dashboard/DailyMealScreen", () => ({
  default: () => <div data-testid="daily-meal-screen">Daily Meal Screen</div>,
}));

vi.mock("@/components/ui/navbar", () => ({
  default: ({ currentView }: { currentView: string }) => (
    <nav data-testid="navbar">NavBar - {currentView}</nav>
  ),
}));

vi.mock("@/components/ui/BottomNav", () => ({
  default: () => <div data-testid="bottom-nav">Bottom Nav</div>,
}));

vi.mock("@/components/ui/MobileHeader", () => ({
  default: () => <header data-testid="mobile-header">Mobile Header</header>,
}));

describe("DailyTracker Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    // Reset auth state
    mockAuthState.user = null;
    mockAuthState.plan = null;
    mockAuthState.loading = false;
    mockAuthState.token = null;
  });

  it("redirects to register when not authenticated", async () => {
    mockAuthState.user = null;
    mockAuthState.token = null;
    mockAuthState.loading = false;

    render(<DailyTracker />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/register");
    });
  });

  it("shows loading state when loading is true", () => {
    mockAuthState.loading = true;

    render(<DailyTracker />);

    expect(
      screen.getByText("Loading your daily tracker...")
    ).toBeInTheDocument();
  });

  it("shows loading when token exists but user not loaded yet", () => {
    mockAuthState.token = "valid_token";
    mockAuthState.user = null;
    mockAuthState.loading = false;

    render(<DailyTracker />);

    expect(
      screen.getByText("Loading your daily tracker...")
    ).toBeInTheDocument();
  });

  it("renders daily meal screen when authenticated", () => {
    mockAuthState.user = mockUser;
    mockAuthState.plan = mockPlan;
    mockAuthState.token = "valid_token";
    mockAuthState.loading = false;

    render(<DailyTracker />);

    expect(screen.getByTestId("daily-meal-screen")).toBeInTheDocument();
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("bottom-nav")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-header")).toBeInTheDocument();
  });

  it("renders navbar with daily view", () => {
    mockAuthState.user = mockUser;
    mockAuthState.plan = mockPlan;
    mockAuthState.token = "valid_token";

    render(<DailyTracker />);

    expect(screen.getByText("NavBar - daily")).toBeInTheDocument();
  });

  it("does not redirect when authenticated with user and token", () => {
    mockAuthState.user = mockUser;
    mockAuthState.token = "valid_token";
    mockAuthState.loading = false;

    render(<DailyTracker />);

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

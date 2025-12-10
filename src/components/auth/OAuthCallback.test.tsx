import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/test/test-utils";
import OAuthCallback from "./OAuthCallback";
import { mockUser, mockPlan, mockNavigate } from "@/test/mocks";

// Mock react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      search: "?provider=google&action=signin&token=mock_token&userId=user123",
      pathname: "/auth/callback",
    }),
  };
});

// Mock auth store
const mockHandleOAuthCallback = vi.fn();
const mockAuthState = {
  user: null as typeof mockUser | null,
  plan: null as typeof mockPlan | null,
  handleOAuthCallback: mockHandleOAuthCallback,
};

vi.mock("@/stores/authStore", () => ({
  useAuthStore: Object.assign(
    vi.fn(() => mockAuthState),
    { getState: () => mockAuthState }
  ),
}));

// Mock toast
const mockToast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe("OAuthCallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    mockHandleOAuthCallback.mockReset();
    mockAuthState.user = null;
    mockAuthState.plan = null;
  });

  it("shows loading state initially", () => {
    mockHandleOAuthCallback.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<OAuthCallback />);

    expect(screen.getByText("Completing Authentication")).toBeInTheDocument();
  });

  it("shows loading spinner", () => {
    mockHandleOAuthCallback.mockImplementation(() => new Promise(() => {}));

    render(<OAuthCallback />);

    // The loading spinner should be present
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("navigates to daily-tracker when user has plan", async () => {
    mockHandleOAuthCallback.mockResolvedValue(undefined);
    mockAuthState.user = mockUser;
    mockAuthState.plan = mockPlan;

    render(<OAuthCallback />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/daily-tracker");
    });
  });

  it("navigates to weekly-overview when user exists but no plan", async () => {
    mockHandleOAuthCallback.mockResolvedValue(undefined);
    mockAuthState.user = mockUser;
    mockAuthState.plan = null;

    render(<OAuthCallback />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/weekly-overview");
    });
  });

  it("navigates to register when no user", async () => {
    mockHandleOAuthCallback.mockResolvedValue(undefined);
    mockAuthState.user = null;
    mockAuthState.plan = null;

    render(<OAuthCallback />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/register");
    });
  });

  it("shows error toast on authentication failure", async () => {
    mockHandleOAuthCallback.mockRejectedValue(new Error("Auth failed"));

    render(<OAuthCallback />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Authentication Failed",
        })
      );
    });
  });

  it("navigates to home on error", async () => {
    mockHandleOAuthCallback.mockRejectedValue(new Error("Auth failed"));

    render(<OAuthCallback />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});

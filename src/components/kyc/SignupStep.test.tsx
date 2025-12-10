import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@/test/test-utils";
import SignupStep from "./SignupStep";
import { AuthData } from "./types";

// Mock Google OAuth
vi.mock("@/lib/googleOAuth", () => ({
  initGoogleOAuth: vi.fn().mockResolvedValue(undefined),
  triggerGoogleSignIn: vi.fn(),
}));

// Mock Google Icon
vi.mock("@/assets/icons/google", () => ({
  default: () => <span data-testid="google-icon">G</span>,
}));

describe("SignupStep", () => {
  const mockAuthData: AuthData = {
    name: "",
    email: "",
    password: "",
    authMethod: "email",
  };

  const mockSetAuthData = vi.fn();
  const mockOnSignupEmail = vi.fn();
  const mockOnGoogleSignup = vi.fn();

  const defaultProps = {
    authData: mockAuthData,
    setAuthData: mockSetAuthData,
    loading: false,
    error: "",
    onSignupEmail: mockOnSignupEmail,
    onGoogleSignup: mockOnGoogleSignup,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders signup form with all fields", () => {
    render(<SignupStep {...defaultProps} />);

    expect(screen.getByPlaceholderText("Full Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });

  it("renders Google signup button", () => {
    render(<SignupStep {...defaultProps} />);

    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
    expect(screen.getByTestId("google-icon")).toBeInTheDocument();
  });

  it("renders sign up button", () => {
    render(<SignupStep {...defaultProps} />);

    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();
  });

  it("displays error message when error prop is set", () => {
    render(<SignupStep {...defaultProps} error="Email already exists" />);

    expect(screen.getByText("Email already exists")).toBeInTheDocument();
  });

  it("calls onSignupEmail when sign up button is clicked", () => {
    render(<SignupStep {...defaultProps} />);

    const signUpButton = screen.getByRole("button", { name: "Sign Up" });
    fireEvent.click(signUpButton);

    expect(mockOnSignupEmail).toHaveBeenCalledTimes(1);
  });

  it("updates name field when user types", () => {
    render(<SignupStep {...defaultProps} />);

    const nameInput = screen.getByPlaceholderText("Full Name");
    fireEvent.change(nameInput, { target: { value: "John Doe" } });

    expect(mockSetAuthData).toHaveBeenCalled();
  });

  it("updates email field when user types", () => {
    render(<SignupStep {...defaultProps} />);

    const emailInput = screen.getByPlaceholderText("Email");
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });

    expect(mockSetAuthData).toHaveBeenCalled();
  });

  it("updates password field when user types", () => {
    render(<SignupStep {...defaultProps} />);

    const passwordInput = screen.getByPlaceholderText("Password");
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(mockSetAuthData).toHaveBeenCalled();
  });

  it("disables buttons when loading", () => {
    render(<SignupStep {...defaultProps} loading={true} />);

    const googleButton = screen.getByText("Loading...");
    expect(googleButton.closest("button")).toBeDisabled();
  });

  it("shows loading text on Google button when loading", () => {
    render(<SignupStep {...defaultProps} loading={true} />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("displays page title and subtitle", () => {
    render(<SignupStep {...defaultProps} />);

    expect(screen.getByText("Get Started")).toBeInTheDocument();
    expect(
      screen.getByText("Create your account to begin")
    ).toBeInTheDocument();
  });

  it("shows 'Or with email' divider", () => {
    render(<SignupStep {...defaultProps} />);

    expect(screen.getByText("Or with email")).toBeInTheDocument();
  });
});

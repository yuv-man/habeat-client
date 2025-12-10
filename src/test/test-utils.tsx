import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";

// Wrapper with all providers
interface WrapperProps {
  children: React.ReactNode;
}

const AllProviders = ({ children }: WrapperProps) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

// Custom render function with providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllProviders, ...options });

// Re-export everything from testing library
export * from "@testing-library/react";
export { customRender as render };

// Mock the auth store
export const mockAuthStore = vi.fn();

export const createAuthStoreMock = (overrides = {}) => {
  return {
    user: null,
    plan: null,
    token: null,
    loading: false,
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
    setUser: vi.fn(),
    setPlan: vi.fn(),
    setLoading: vi.fn(),
    setToken: vi.fn(),
    fetchUser: vi.fn(),
    oauthSignin: vi.fn(),
    oauthSignup: vi.fn(),
    handleOAuthCallback: vi.fn(),
    guestSignin: vi.fn(),
    generateMealPlan: vi.fn(),
    updateMealInPlan: vi.fn(),
    updateFavorite: vi.fn(),
    ...overrides,
  };
};

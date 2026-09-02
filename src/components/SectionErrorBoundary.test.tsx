import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@/test/test-utils";
import SectionErrorBoundary from "./SectionErrorBoundary";

const Boom = () => {
  throw new Error("widget exploded");
};

describe("SectionErrorBoundary", () => {
  beforeEach(() => {
    // React logs caught render errors; silence it so the run stays readable.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("renders its children when nothing is wrong", () => {
    render(
      <SectionErrorBoundary label="challenges">
        <p>all good</p>
      </SectionErrorBoundary>
    );
    expect(screen.getByText("all good")).toBeInTheDocument();
  });

  it("contains the failure instead of rethrowing", () => {
    render(
      <SectionErrorBoundary label="challenges">
        <Boom />
      </SectionErrorBoundary>
    );
    expect(screen.getByText("Couldn't load challenges")).toBeInTheDocument();
  });

  it("names the section so the user knows what they lost", () => {
    render(
      <SectionErrorBoundary label="eating patterns">
        <Boom />
      </SectionErrorBoundary>
    );
    expect(screen.getByText("Couldn't load eating patterns")).toBeInTheDocument();
  });

  it("leaves the rest of the page standing", () => {
    // The whole point: a thrown widget must not take its siblings with it.
    render(
      <div>
        <p>page heading</p>
        <SectionErrorBoundary label="challenges">
          <Boom />
        </SectionErrorBoundary>
        <p>meals list</p>
      </div>
    );
    expect(screen.getByText("page heading")).toBeInTheDocument();
    expect(screen.getByText("meals list")).toBeInTheDocument();
    expect(screen.getByText("Couldn't load challenges")).toBeInTheDocument();
  });

  it("recovers when the reset key changes", () => {
    const { rerender } = render(
      <SectionErrorBoundary label="challenges" resetKey="/a">
        <Boom />
      </SectionErrorBoundary>
    );
    expect(screen.getByText("Couldn't load challenges")).toBeInTheDocument();

    rerender(
      <SectionErrorBoundary label="challenges" resetKey="/b">
        <p>recovered</p>
      </SectionErrorBoundary>
    );
    expect(screen.getByText("recovered")).toBeInTheDocument();
    expect(screen.queryByText("Couldn't load challenges")).toBeNull();
  });

  it("stays broken while the reset key is unchanged", () => {
    const { rerender } = render(
      <SectionErrorBoundary label="challenges" resetKey="/a">
        <Boom />
      </SectionErrorBoundary>
    );
    rerender(
      <SectionErrorBoundary label="challenges" resetKey="/a">
        <p>recovered</p>
      </SectionErrorBoundary>
    );
    expect(screen.getByText("Couldn't load challenges")).toBeInTheDocument();
  });
});

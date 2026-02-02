// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { Providers } from "./providers";

vi.mock("next-auth/react", () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("next-themes", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("Providers", () => {
  describe("when rendered with children", () => {
    it("should render the children content", () => {
      render(
        <Providers>
          <p>Test Child</p>
        </Providers>
      );
      expect(screen.getByText("Test Child")).toBeInTheDocument();
    });
  });
});

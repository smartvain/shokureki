// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { AuthGuard } from "./auth-guard";

const mockRedirect = vi.fn();

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}));

import { useSession } from "next-auth/react";

describe("AuthGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when session is loading", () => {
    it("should display the loading message", () => {
      vi.mocked(useSession).mockReturnValue({
        status: "loading",
        data: null,
        update: vi.fn(),
      } as ReturnType<typeof useSession>);

      render(
        <AuthGuard>
          <p>Protected</p>
        </AuthGuard>
      );
      expect(screen.getByText("読み込み中...")).toBeInTheDocument();
      expect(screen.queryByText("Protected")).not.toBeInTheDocument();
    });
  });

  describe("when session is authenticated", () => {
    it("should render the children", () => {
      vi.mocked(useSession).mockReturnValue({
        status: "authenticated",
        data: { user: { id: "1" }, expires: "" },
        update: vi.fn(),
      } as unknown as ReturnType<typeof useSession>);

      render(
        <AuthGuard>
          <p>Protected</p>
        </AuthGuard>
      );
      expect(screen.getByText("Protected")).toBeInTheDocument();
    });
  });

  describe("when session is unauthenticated", () => {
    it("should redirect to /login", () => {
      vi.mocked(useSession).mockImplementation(((opts?: {
        required?: boolean;
        onUnauthenticated?: () => void;
      }) => {
        if (opts?.required) {
          opts.onUnauthenticated?.();
        }
        return { status: "unauthenticated", data: null, update: vi.fn() };
      }) as typeof useSession);

      render(
        <AuthGuard>
          <p>Protected</p>
        </AuthGuard>
      );
      expect(mockRedirect).toHaveBeenCalledWith("/login");
    });
  });
});

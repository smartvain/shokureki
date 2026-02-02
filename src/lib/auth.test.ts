import { vi } from "vitest";

vi.mock("next-auth", () => {
  const mockAuth = vi.fn();
  const mockSignIn = vi.fn();
  const mockSignOut = vi.fn();
  const mockHandlers = { GET: vi.fn(), POST: vi.fn() };

  return {
    default: () => ({
      handlers: mockHandlers,
      auth: mockAuth,
      signIn: mockSignIn,
      signOut: mockSignOut,
    }),
  };
});

vi.mock("next-auth/providers/github", () => ({
  default: vi.fn((config) => ({ id: "github", ...config })),
}));

vi.mock("@auth/drizzle-adapter", () => ({
  DrizzleAdapter: vi.fn(() => ({})),
}));

vi.mock("@/db", () => ({
  db: {},
}));

vi.mock("@/db/schema", () => ({
  users: {},
  accounts: {},
  sessions: {},
}));

describe("auth config", () => {
  describe("when imported", () => {
    it("should export auth, handlers, signIn, and signOut", async () => {
      const authModule = await import("./auth");
      expect(authModule).toHaveProperty("auth");
      expect(authModule).toHaveProperty("handlers");
      expect(authModule).toHaveProperty("signIn");
      expect(authModule).toHaveProperty("signOut");
    });
  });
});

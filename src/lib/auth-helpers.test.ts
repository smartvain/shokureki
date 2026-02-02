import { vi, type Mock } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: {
    query: {
      profiles: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(),
  },
}));

vi.mock("@/db/schema", () => ({
  profiles: {
    userId: "user_id",
    id: "id",
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((col, val) => ({ col, val })),
}));

import { getAuthenticatedUserId, unauthorizedResponse, getOrCreateProfileId } from "./auth-helpers";
import { auth } from "@/lib/auth";
import { db } from "@/db";

describe("getAuthenticatedUserId", () => {
  describe("when session exists with a valid user", () => {
    it("should return the user id", async () => {
      (auth as Mock).mockResolvedValue({ user: { id: "user-123" } });
      expect(await getAuthenticatedUserId()).toBe("user-123");
    });
  });

  describe("when session is null", () => {
    it("should return null", async () => {
      (auth as Mock).mockResolvedValue(null);
      expect(await getAuthenticatedUserId()).toBeNull();
    });
  });

  describe("when session has no user", () => {
    it("should return null", async () => {
      (auth as Mock).mockResolvedValue({});
      expect(await getAuthenticatedUserId()).toBeNull();
    });
  });

  describe("when user has no id", () => {
    it("should return null", async () => {
      (auth as Mock).mockResolvedValue({ user: {} });
      expect(await getAuthenticatedUserId()).toBeNull();
    });
  });
});

describe("unauthorizedResponse", () => {
  describe("when called", () => {
    it("should return 401 status", () => {
      const response = unauthorizedResponse();
      expect(response.status).toBe(401);
    });

    it("should return error message in JSON body", async () => {
      const response = unauthorizedResponse();
      const body = await response.json();
      expect(body.error).toBe("認証が必要です");
    });
  });
});

describe("getOrCreateProfileId", () => {
  describe("when a profile already exists", () => {
    it("should return the existing profile id", async () => {
      (db.query.profiles.findFirst as Mock).mockResolvedValue({ id: "profile-123" });
      expect(await getOrCreateProfileId("user-123")).toBe("profile-123");
    });
  });

  describe("when no profile exists", () => {
    it("should create a new profile and return its id", async () => {
      (db.query.profiles.findFirst as Mock).mockResolvedValue(undefined);

      const returningMock = vi.fn().mockResolvedValue([{ id: "new-profile-456" }]);
      const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
      (db.insert as Mock).mockReturnValue({ values: valuesMock });

      expect(await getOrCreateProfileId("user-123")).toBe("new-profile-456");
    });
  });
});

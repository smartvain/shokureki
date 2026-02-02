import { cn } from "@/lib/utils";

describe("cn", () => {
  describe("when given multiple class names", () => {
    it("should merge them into a single string", () => {
      expect(cn("foo", "bar")).toBe("foo bar");
    });
  });

  describe("when given conditional classes", () => {
    it("should exclude falsy values", () => {
      expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
    });
  });

  describe("when given conflicting Tailwind classes", () => {
    it("should keep the last-specified class", () => {
      expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    });
  });

  describe("when given no arguments", () => {
    it("should return an empty string", () => {
      expect(cn()).toBe("");
    });
  });
});

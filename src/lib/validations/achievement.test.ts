import { achievementFormSchema } from "@/lib/validations/achievement";

describe("achievementFormSchema", () => {
  const validData = {
    title: "CI パイプライン構築",
    description: "GitHub Actions を用いたCI/CDパイプラインを構築",
    category: "development" as const,
  };

  describe("when given valid data", () => {
    it("should accept minimal required fields", () => {
      expect(achievementFormSchema.safeParse(validData).success).toBe(true);
    });

    it("should accept all optional fields", () => {
      const result = achievementFormSchema.safeParse({
        ...validData,
        technologies: "TypeScript, GitHub Actions",
        period: "2025-01",
        projectId: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("when given invalid data", () => {
    it("should reject an empty title", () => {
      expect(achievementFormSchema.safeParse({ ...validData, title: "" }).success).toBe(false);
    });

    it("should reject an invalid category", () => {
      expect(achievementFormSchema.safeParse({ ...validData, category: "invalid" }).success).toBe(
        false
      );
    });

    it("should reject an invalid period format", () => {
      expect(achievementFormSchema.safeParse({ ...validData, period: "2025-1" }).success).toBe(
        false
      );
    });
  });

  describe("when given edge-case data", () => {
    it("should accept an empty string for period", () => {
      expect(achievementFormSchema.safeParse({ ...validData, period: "" }).success).toBe(true);
    });
  });
});

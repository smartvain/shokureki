import { achievementFormSchema } from "@/lib/validations/achievement";

describe("achievementFormSchema", () => {
  const validData = {
    title: "CI パイプライン構築",
    description: "GitHub Actions を用いたCI/CDパイプラインを構築",
    category: "development" as const,
  };

  it("accepts valid minimal data", () => {
    expect(achievementFormSchema.safeParse(validData).success).toBe(true);
  });

  it("accepts valid data with all optional fields", () => {
    const result = achievementFormSchema.safeParse({
      ...validData,
      technologies: "TypeScript, GitHub Actions",
      period: "2025-01",
      projectId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    expect(
      achievementFormSchema.safeParse({ ...validData, title: "" }).success
    ).toBe(false);
  });

  it("rejects invalid category", () => {
    expect(
      achievementFormSchema.safeParse({ ...validData, category: "invalid" }).success
    ).toBe(false);
  });

  it("rejects invalid period format", () => {
    expect(
      achievementFormSchema.safeParse({ ...validData, period: "2025-1" }).success
    ).toBe(false);
  });

  it("accepts empty string for period", () => {
    expect(
      achievementFormSchema.safeParse({ ...validData, period: "" }).success
    ).toBe(true);
  });
});

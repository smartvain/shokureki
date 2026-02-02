import { documentGenerateSchema } from "@/lib/validations/document";

describe("documentGenerateSchema", () => {
  const validData = {
    format: "reverse_chronological" as const,
    achievementIds: ["550e8400-e29b-41d4-a716-446655440000"],
  };

  it("accepts valid data", () => {
    expect(documentGenerateSchema.safeParse(validData).success).toBe(true);
  });

  it("rejects empty achievementIds", () => {
    expect(
      documentGenerateSchema.safeParse({ ...validData, achievementIds: [] }).success
    ).toBe(false);
  });

  it("rejects invalid format", () => {
    expect(
      documentGenerateSchema.safeParse({ ...validData, format: "unknown" }).success
    ).toBe(false);
  });

  it("accepts all valid formats", () => {
    for (const format of ["reverse_chronological", "chronological", "career_based"]) {
      expect(
        documentGenerateSchema.safeParse({ ...validData, format }).success
      ).toBe(true);
    }
  });

  it("accepts optional targetCompany and targetPosition", () => {
    expect(
      documentGenerateSchema.safeParse({
        ...validData,
        targetCompany: "株式会社サンプル",
        targetPosition: "フロントエンドエンジニア",
      }).success
    ).toBe(true);
  });
});

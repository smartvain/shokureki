import { workHistoryFormSchema } from "@/lib/validations/work-history";

describe("workHistoryFormSchema", () => {
  const validData = {
    companyName: "Acme Corp",
    startDate: "2023-04",
  };

  it("accepts valid minimal data", () => {
    expect(workHistoryFormSchema.safeParse(validData).success).toBe(true);
  });

  it("rejects empty company name", () => {
    expect(workHistoryFormSchema.safeParse({ ...validData, companyName: "" }).success).toBe(false);
  });

  it("rejects invalid startDate format", () => {
    expect(workHistoryFormSchema.safeParse({ ...validData, startDate: "2023/04" }).success).toBe(
      false
    );
  });

  it("rejects empty startDate", () => {
    expect(workHistoryFormSchema.safeParse({ ...validData, startDate: "" }).success).toBe(false);
  });

  it("accepts empty endDate", () => {
    expect(workHistoryFormSchema.safeParse({ ...validData, endDate: "" }).success).toBe(true);
  });

  it("accepts isCurrent flag", () => {
    expect(workHistoryFormSchema.safeParse({ ...validData, isCurrent: true }).success).toBe(true);
  });
});

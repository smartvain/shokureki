import { workHistoryFormSchema } from "@/lib/validations/work-history";

describe("workHistoryFormSchema", () => {
  const validData = {
    companyName: "Acme Corp",
    startDate: "2023-04",
  };

  describe("when given valid data", () => {
    it("should accept minimal required fields", () => {
      expect(workHistoryFormSchema.safeParse(validData).success).toBe(true);
    });

    it("should accept an empty endDate", () => {
      expect(workHistoryFormSchema.safeParse({ ...validData, endDate: "" }).success).toBe(true);
    });

    it("should accept the isCurrent flag", () => {
      expect(workHistoryFormSchema.safeParse({ ...validData, isCurrent: true }).success).toBe(true);
    });
  });

  describe("when given invalid data", () => {
    it("should reject an empty company name", () => {
      expect(workHistoryFormSchema.safeParse({ ...validData, companyName: "" }).success).toBe(
        false
      );
    });

    it("should reject an invalid startDate format", () => {
      expect(workHistoryFormSchema.safeParse({ ...validData, startDate: "2023/04" }).success).toBe(
        false
      );
    });

    it("should reject an empty startDate", () => {
      expect(workHistoryFormSchema.safeParse({ ...validData, startDate: "" }).success).toBe(false);
    });
  });
});

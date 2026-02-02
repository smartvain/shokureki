import { projectFormSchema } from "@/lib/validations/project";

describe("projectFormSchema", () => {
  describe("when given valid data", () => {
    it("should accept minimal required fields", () => {
      expect(projectFormSchema.safeParse({ name: "My Project" }).success).toBe(true);
    });

    it("should accept valid date format", () => {
      expect(
        projectFormSchema.safeParse({
          name: "Project",
          startDate: "2024-01",
          endDate: "2024-12",
        }).success
      ).toBe(true);
    });

    it("should accept empty date strings", () => {
      expect(
        projectFormSchema.safeParse({ name: "Project", startDate: "", endDate: "" }).success
      ).toBe(true);
    });
  });

  describe("when given invalid data", () => {
    it("should reject an empty name", () => {
      expect(projectFormSchema.safeParse({ name: "" }).success).toBe(false);
    });

    it("should reject an invalid date format", () => {
      expect(projectFormSchema.safeParse({ name: "Project", startDate: "invalid" }).success).toBe(
        false
      );
    });
  });
});

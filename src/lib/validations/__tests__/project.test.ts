import { projectFormSchema } from "@/lib/validations/project";

describe("projectFormSchema", () => {
  it("accepts valid minimal data", () => {
    expect(projectFormSchema.safeParse({ name: "My Project" }).success).toBe(true);
  });

  it("rejects empty name", () => {
    expect(projectFormSchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("accepts valid date format", () => {
    expect(
      projectFormSchema.safeParse({
        name: "Project",
        startDate: "2024-01",
        endDate: "2024-12",
      }).success
    ).toBe(true);
  });

  it("rejects invalid date format", () => {
    expect(
      projectFormSchema.safeParse({ name: "Project", startDate: "invalid" }).success
    ).toBe(false);
  });

  it("accepts empty date strings", () => {
    expect(
      projectFormSchema.safeParse({ name: "Project", startDate: "", endDate: "" }).success
    ).toBe(true);
  });
});

import {
  profileFormSchema,
  educationFormSchema,
  certificationFormSchema,
  skillFormSchema,
} from "@/lib/validations/profile";

describe("profileFormSchema", () => {
  it("accepts valid minimal data", () => {
    expect(profileFormSchema.safeParse({ lastName: "田中", firstName: "太郎" }).success).toBe(true);
  });

  it("rejects empty lastName", () => {
    expect(profileFormSchema.safeParse({ lastName: "", firstName: "太郎" }).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      profileFormSchema.safeParse({
        lastName: "田中",
        firstName: "太郎",
        email: "not-an-email",
      }).success
    ).toBe(false);
  });

  it("accepts empty email", () => {
    expect(
      profileFormSchema.safeParse({
        lastName: "田中",
        firstName: "太郎",
        email: "",
      }).success
    ).toBe(true);
  });

  it("validates postal code format", () => {
    const base = { lastName: "田中", firstName: "太郎" };
    expect(profileFormSchema.safeParse({ ...base, postalCode: "123-4567" }).success).toBe(true);
    expect(profileFormSchema.safeParse({ ...base, postalCode: "1234567" }).success).toBe(true);
    expect(profileFormSchema.safeParse({ ...base, postalCode: "12-34567" }).success).toBe(false);
  });
});

describe("educationFormSchema", () => {
  it("accepts valid data", () => {
    expect(educationFormSchema.safeParse({ schoolName: "東京大学" }).success).toBe(true);
  });

  it("rejects empty school name", () => {
    expect(educationFormSchema.safeParse({ schoolName: "" }).success).toBe(false);
  });
});

describe("certificationFormSchema", () => {
  it("accepts valid data", () => {
    expect(certificationFormSchema.safeParse({ name: "AWS SAA" }).success).toBe(true);
  });

  it("rejects empty name", () => {
    expect(certificationFormSchema.safeParse({ name: "" }).success).toBe(false);
  });
});

describe("skillFormSchema", () => {
  it("accepts valid data", () => {
    expect(
      skillFormSchema.safeParse({
        category: "言語",
        name: "TypeScript",
        yearsOfExperience: 3,
      }).success
    ).toBe(true);
  });

  it("rejects empty category", () => {
    expect(skillFormSchema.safeParse({ category: "", name: "TypeScript" }).success).toBe(false);
  });

  it("accepts null yearsOfExperience", () => {
    expect(
      skillFormSchema.safeParse({
        category: "言語",
        name: "TypeScript",
        yearsOfExperience: null,
      }).success
    ).toBe(true);
  });
});

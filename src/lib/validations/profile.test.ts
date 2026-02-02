import {
  profileFormSchema,
  educationFormSchema,
  certificationFormSchema,
  skillFormSchema,
} from "@/lib/validations/profile";

describe("profileFormSchema", () => {
  describe("when given valid data", () => {
    it("should accept minimal required fields", () => {
      expect(profileFormSchema.safeParse({ lastName: "田中", firstName: "太郎" }).success).toBe(
        true
      );
    });

    it("should accept an empty email", () => {
      expect(
        profileFormSchema.safeParse({
          lastName: "田中",
          firstName: "太郎",
          email: "",
        }).success
      ).toBe(true);
    });

    it("should accept valid postal code formats", () => {
      const base = { lastName: "田中", firstName: "太郎" };
      expect(profileFormSchema.safeParse({ ...base, postalCode: "123-4567" }).success).toBe(true);
      expect(profileFormSchema.safeParse({ ...base, postalCode: "1234567" }).success).toBe(true);
    });
  });

  describe("when given invalid data", () => {
    it("should reject an empty lastName", () => {
      expect(profileFormSchema.safeParse({ lastName: "", firstName: "太郎" }).success).toBe(false);
    });

    it("should reject an invalid email", () => {
      expect(
        profileFormSchema.safeParse({
          lastName: "田中",
          firstName: "太郎",
          email: "not-an-email",
        }).success
      ).toBe(false);
    });

    it("should reject an invalid postal code format", () => {
      const base = { lastName: "田中", firstName: "太郎" };
      expect(profileFormSchema.safeParse({ ...base, postalCode: "12-34567" }).success).toBe(false);
    });
  });
});

describe("educationFormSchema", () => {
  describe("when given valid data", () => {
    it("should accept a valid school name", () => {
      expect(educationFormSchema.safeParse({ schoolName: "東京大学" }).success).toBe(true);
    });
  });

  describe("when given invalid data", () => {
    it("should reject an empty school name", () => {
      expect(educationFormSchema.safeParse({ schoolName: "" }).success).toBe(false);
    });
  });
});

describe("certificationFormSchema", () => {
  describe("when given valid data", () => {
    it("should accept a valid certification name", () => {
      expect(certificationFormSchema.safeParse({ name: "AWS SAA" }).success).toBe(true);
    });
  });

  describe("when given invalid data", () => {
    it("should reject an empty name", () => {
      expect(certificationFormSchema.safeParse({ name: "" }).success).toBe(false);
    });
  });
});

describe("skillFormSchema", () => {
  describe("when given valid data", () => {
    it("should accept all required fields", () => {
      expect(
        skillFormSchema.safeParse({
          category: "言語",
          name: "TypeScript",
          yearsOfExperience: 3,
        }).success
      ).toBe(true);
    });

    it("should accept null yearsOfExperience", () => {
      expect(
        skillFormSchema.safeParse({
          category: "言語",
          name: "TypeScript",
          yearsOfExperience: null,
        }).success
      ).toBe(true);
    });
  });

  describe("when given invalid data", () => {
    it("should reject an empty category", () => {
      expect(skillFormSchema.safeParse({ category: "", name: "TypeScript" }).success).toBe(false);
    });
  });
});

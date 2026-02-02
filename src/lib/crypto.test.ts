import { encrypt, decrypt } from "@/lib/crypto";
import { randomBytes } from "crypto";

describe("encrypt/decrypt", () => {
  const testKey = randomBytes(32).toString("hex");

  beforeEach(() => {
    process.env.ENCRYPTION_KEY = testKey;
  });

  afterEach(() => {
    delete process.env.ENCRYPTION_KEY;
  });

  describe("when performing a round-trip", () => {
    it("should decrypt to the original plaintext", () => {
      const plaintext = "hello world";
      const ciphertext = encrypt(plaintext);
      expect(decrypt(ciphertext)).toBe(plaintext);
    });

    it("should handle unicode text correctly", () => {
      const plaintext = "職務経歴書";
      const ciphertext = encrypt(plaintext);
      expect(decrypt(ciphertext)).toBe(plaintext);
    });
  });

  describe("when encrypting the same plaintext twice", () => {
    it("should produce different ciphertexts due to random IV", () => {
      const a = encrypt("determinism test");
      const b = encrypt("determinism test");
      expect(a).not.toBe(b);
    });
  });

  describe("when inspecting ciphertext format", () => {
    it("should follow iv:authTag:encrypted format", () => {
      const ciphertext = encrypt("test");
      const parts = ciphertext.split(":");
      expect(parts).toHaveLength(3);
      expect(parts[0]).toHaveLength(24); // IV: 12 bytes = 24 hex chars
      expect(parts[1]).toHaveLength(32); // AuthTag: 16 bytes = 32 hex chars
    });
  });

  describe("when ENCRYPTION_KEY is not set", () => {
    it("should throw an error", () => {
      delete process.env.ENCRYPTION_KEY;
      expect(() => encrypt("test")).toThrow("ENCRYPTION_KEY environment variable is not set");
    });
  });

  describe("when given an empty string", () => {
    it("should encrypt and decrypt correctly", () => {
      const ciphertext = encrypt("");
      expect(decrypt(ciphertext)).toBe("");
    });
  });
});

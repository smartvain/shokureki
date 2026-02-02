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

  it("encrypts and decrypts a string round-trip", () => {
    const plaintext = "hello world";
    const ciphertext = encrypt(plaintext);
    expect(decrypt(ciphertext)).toBe(plaintext);
  });

  it("produces different ciphertexts for the same plaintext (random IV)", () => {
    const a = encrypt("determinism test");
    const b = encrypt("determinism test");
    expect(a).not.toBe(b);
  });

  it("ciphertext format is iv:authTag:encrypted", () => {
    const ciphertext = encrypt("test");
    const parts = ciphertext.split(":");
    expect(parts).toHaveLength(3);
    expect(parts[0]).toHaveLength(24); // IV: 12 bytes = 24 hex chars
    expect(parts[1]).toHaveLength(32); // AuthTag: 16 bytes = 32 hex chars
  });

  it("throws when ENCRYPTION_KEY is not set", () => {
    delete process.env.ENCRYPTION_KEY;
    expect(() => encrypt("test")).toThrow(
      "ENCRYPTION_KEY environment variable is not set"
    );
  });

  it("handles empty string", () => {
    const ciphertext = encrypt("");
    expect(decrypt(ciphertext)).toBe("");
  });

  it("handles unicode text", () => {
    const plaintext = "職務経歴書";
    const ciphertext = encrypt(plaintext);
    expect(decrypt(ciphertext)).toBe(plaintext);
  });
});

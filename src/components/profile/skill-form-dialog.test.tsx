// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkillFormDialog } from "./skill-form-dialog";

const mockFetch = vi.fn();
global.fetch = mockFetch;

function defaultProps(
  overrides: Partial<Parameters<typeof SkillFormDialog>[0]> = {}
): Parameters<typeof SkillFormDialog>[0] {
  return {
    open: true,
    onOpenChange: vi.fn(),
    onSuccess: vi.fn(),
    ...overrides,
  };
}

describe("SkillFormDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true });
  });

  describe("when opened", () => {
    it("should display the dialog title", () => {
      render(<SkillFormDialog {...defaultProps()} />);
      expect(screen.getByText("スキルを追加")).toBeInTheDocument();
    });

    it("should display form labels", () => {
      render(<SkillFormDialog {...defaultProps()} />);
      expect(screen.getByText("カテゴリ *")).toBeInTheDocument();
      expect(screen.getByText("スキル名 *")).toBeInTheDocument();
      expect(screen.getByText("レベル")).toBeInTheDocument();
      expect(screen.getByText("経験年数")).toBeInTheDocument();
    });

    it("should display the submit button", () => {
      render(<SkillFormDialog {...defaultProps()} />);
      expect(screen.getByRole("button", { name: "追加" })).toBeInTheDocument();
    });

    it("should display placeholders for inputs", () => {
      render(<SkillFormDialog {...defaultProps()} />);
      expect(screen.getByPlaceholderText("例: TypeScript")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("3")).toBeInTheDocument();
    });
  });

  describe("when the cancel button is clicked", () => {
    it("should call onOpenChange with false", async () => {
      const user = userEvent.setup();
      const props = defaultProps();
      render(<SkillFormDialog {...props} />);

      await user.click(screen.getByRole("button", { name: "キャンセル" }));
      expect(props.onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});

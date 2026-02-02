// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AchievementFormDialog } from "./achievement-form-dialog";

const mockFetch = vi.fn();
global.fetch = mockFetch;

function defaultProps(
  overrides: Partial<Parameters<typeof AchievementFormDialog>[0]> = {}
): Parameters<typeof AchievementFormDialog>[0] {
  return {
    open: true,
    onOpenChange: vi.fn(),
    projects: [],
    onSuccess: vi.fn(),
    ...overrides,
  };
}

describe("AchievementFormDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true });
  });

  describe("when opened in create mode", () => {
    it("should display the create title", () => {
      render(<AchievementFormDialog {...defaultProps()} />);
      expect(screen.getByText("実績を作成")).toBeInTheDocument();
    });

    it("should display the create button", () => {
      render(<AchievementFormDialog {...defaultProps()} />);
      expect(screen.getByRole("button", { name: "作成" })).toBeInTheDocument();
    });

    it("should display form labels", () => {
      render(<AchievementFormDialog {...defaultProps()} />);
      expect(screen.getByText("タイトル *")).toBeInTheDocument();
      expect(screen.getByText("説明 *")).toBeInTheDocument();
      expect(screen.getByText("技術スタック")).toBeInTheDocument();
    });
  });

  describe("when opened in edit mode", () => {
    const achievement = {
      id: "test-id",
      title: "テスト実績",
      description: "テスト説明",
      category: "development",
      technologies: ["React", "TypeScript"],
      period: "2024-01",
      projectId: null,
    };

    it("should display the edit title", () => {
      render(<AchievementFormDialog {...defaultProps({ achievement })} />);
      expect(screen.getByText("実績を編集")).toBeInTheDocument();
    });

    it("should display the update button", () => {
      render(<AchievementFormDialog {...defaultProps({ achievement })} />);
      expect(screen.getByRole("button", { name: "更新" })).toBeInTheDocument();
    });

    it("should pre-fill form fields with existing data", () => {
      render(<AchievementFormDialog {...defaultProps({ achievement })} />);
      expect(screen.getByDisplayValue("テスト実績")).toBeInTheDocument();
      expect(screen.getByDisplayValue("テスト説明")).toBeInTheDocument();
      expect(screen.getByDisplayValue("React, TypeScript")).toBeInTheDocument();
    });
  });

  describe("when the form is submitted in create mode", () => {
    it("should POST to /api/achievements", async () => {
      const user = userEvent.setup();
      const props = defaultProps();
      render(<AchievementFormDialog {...props} />);

      await user.type(screen.getByPlaceholderText("例: 認証基盤の設計・実装"), "新しい実績");
      await user.type(screen.getByPlaceholderText("職務経歴書に記載する形式で記述..."), "説明文");
      await user.click(screen.getByRole("button", { name: "作成" }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/achievements",
          expect.objectContaining({ method: "POST" })
        );
      });
    });

    it("should call onSuccess after successful submission", async () => {
      const user = userEvent.setup();
      const props = defaultProps();
      render(<AchievementFormDialog {...props} />);

      await user.type(screen.getByPlaceholderText("例: 認証基盤の設計・実装"), "新しい実績");
      await user.type(screen.getByPlaceholderText("職務経歴書に記載する形式で記述..."), "説明文");
      await user.click(screen.getByRole("button", { name: "作成" }));

      await waitFor(() => {
        expect(props.onSuccess).toHaveBeenCalled();
      });
    });
  });

  describe("when the cancel button is clicked", () => {
    it("should call onOpenChange with false", async () => {
      const user = userEvent.setup();
      const props = defaultProps();
      render(<AchievementFormDialog {...props} />);

      await user.click(screen.getByRole("button", { name: "キャンセル" }));
      expect(props.onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});

// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectFormDialog } from "./project-form-dialog";

const mockFetch = vi.fn();
global.fetch = mockFetch;

function defaultProps(
  overrides: Partial<Parameters<typeof ProjectFormDialog>[0]> = {}
): Parameters<typeof ProjectFormDialog>[0] {
  return {
    open: true,
    onOpenChange: vi.fn(),
    onSuccess: vi.fn(),
    ...overrides,
  };
}

describe("ProjectFormDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true });
  });

  describe("when opened in create mode", () => {
    it("should display the create title", () => {
      render(<ProjectFormDialog {...defaultProps()} />);
      expect(screen.getByText("プロジェクトを作成")).toBeInTheDocument();
    });

    it("should display the create button", () => {
      render(<ProjectFormDialog {...defaultProps()} />);
      expect(screen.getByRole("button", { name: "作成" })).toBeInTheDocument();
    });

    it("should display form labels", () => {
      render(<ProjectFormDialog {...defaultProps()} />);
      expect(screen.getByText("プロジェクト名 *")).toBeInTheDocument();
      expect(screen.getByText("企業名")).toBeInTheDocument();
      expect(screen.getByText("担当役割")).toBeInTheDocument();
      expect(screen.getByText("チーム規模")).toBeInTheDocument();
    });
  });

  describe("when opened in edit mode", () => {
    const project = {
      id: "test-id",
      name: "テストプロジェクト",
      company: "テスト株式会社",
      startDate: "2024-01",
      endDate: "2024-12",
      description: "テスト説明",
      role: "テックリード",
      teamSize: "5名",
    };

    it("should display the edit title", () => {
      render(<ProjectFormDialog {...defaultProps({ project })} />);
      expect(screen.getByText("プロジェクトを編集")).toBeInTheDocument();
    });

    it("should display the update button", () => {
      render(<ProjectFormDialog {...defaultProps({ project })} />);
      expect(screen.getByRole("button", { name: "更新" })).toBeInTheDocument();
    });

    it("should pre-fill form fields with existing data", () => {
      render(<ProjectFormDialog {...defaultProps({ project })} />);
      expect(screen.getByDisplayValue("テストプロジェクト")).toBeInTheDocument();
      expect(screen.getByDisplayValue("テスト株式会社")).toBeInTheDocument();
      expect(screen.getByDisplayValue("テックリード")).toBeInTheDocument();
    });
  });

  describe("when the form is submitted in create mode", () => {
    it("should POST to /api/projects", async () => {
      const user = userEvent.setup();
      const props = defaultProps();
      render(<ProjectFormDialog {...props} />);

      await user.type(screen.getByPlaceholderText("例: ECサイトリニューアル"), "新プロジェクト");
      await user.click(screen.getByRole("button", { name: "作成" }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/projects",
          expect.objectContaining({ method: "POST" })
        );
      });
    });

    it("should call onSuccess after successful submission", async () => {
      const user = userEvent.setup();
      const props = defaultProps();
      render(<ProjectFormDialog {...props} />);

      await user.type(screen.getByPlaceholderText("例: ECサイトリニューアル"), "新プロジェクト");
      await user.click(screen.getByRole("button", { name: "作成" }));

      await waitFor(() => {
        expect(props.onSuccess).toHaveBeenCalled();
      });
    });
  });

  describe("when the form is submitted in edit mode", () => {
    it("should PATCH to /api/projects/:id", async () => {
      const user = userEvent.setup();
      const project = {
        id: "test-id",
        name: "既存プロジェクト",
        company: null,
        startDate: null,
        endDate: null,
        description: null,
        role: null,
        teamSize: null,
      };
      const props = defaultProps({ project });
      render(<ProjectFormDialog {...props} />);

      await user.click(screen.getByRole("button", { name: "更新" }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/projects/test-id",
          expect.objectContaining({ method: "PATCH" })
        );
      });
    });
  });

  describe("when the cancel button is clicked", () => {
    it("should call onOpenChange with false", async () => {
      const user = userEvent.setup();
      const props = defaultProps();
      render(<ProjectFormDialog {...props} />);

      await user.click(screen.getByRole("button", { name: "キャンセル" }));
      expect(props.onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});

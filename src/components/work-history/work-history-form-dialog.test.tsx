// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WorkHistoryFormDialog } from "./work-history-form-dialog";

const mockFetch = vi.fn();
global.fetch = mockFetch;

function defaultProps(
  overrides: Partial<Parameters<typeof WorkHistoryFormDialog>[0]> = {}
): Parameters<typeof WorkHistoryFormDialog>[0] {
  return {
    open: true,
    onOpenChange: vi.fn(),
    onSuccess: vi.fn(),
    ...overrides,
  };
}

describe("WorkHistoryFormDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true });
  });

  describe("when opened in create mode", () => {
    it("should display the create title", () => {
      render(<WorkHistoryFormDialog {...defaultProps()} />);
      expect(screen.getByText("職務経歴を追加")).toBeInTheDocument();
    });

    it("should display the submit button", () => {
      render(<WorkHistoryFormDialog {...defaultProps()} />);
      expect(screen.getByRole("button", { name: "追加" })).toBeInTheDocument();
    });

    it("should display form labels", () => {
      render(<WorkHistoryFormDialog {...defaultProps()} />);
      expect(screen.getByText("会社名 *")).toBeInTheDocument();
      expect(screen.getByText("会社概要")).toBeInTheDocument();
      expect(screen.getByText("雇用形態")).toBeInTheDocument();
      expect(screen.getByText("開始年月 *")).toBeInTheDocument();
      expect(screen.getByText("終了年月")).toBeInTheDocument();
      expect(screen.getByText("現在在籍中")).toBeInTheDocument();
      expect(screen.getByText("業務内容")).toBeInTheDocument();
    });
  });

  describe("when opened in edit mode", () => {
    const workHistory = {
      id: "test-id",
      companyName: "テスト株式会社",
      companyDescription: "テスト事業",
      employmentType: "正社員",
      position: "エンジニア",
      department: "開発部",
      startDate: "2022-04",
      endDate: "2024-03",
      isCurrent: false,
      responsibilities: "テスト業務",
    };

    it("should display the edit title", () => {
      render(<WorkHistoryFormDialog {...defaultProps({ workHistory })} />);
      expect(screen.getByText("職務経歴を編集")).toBeInTheDocument();
    });

    it("should display the update button", () => {
      render(<WorkHistoryFormDialog {...defaultProps({ workHistory })} />);
      expect(screen.getByRole("button", { name: "更新" })).toBeInTheDocument();
    });

    it("should pre-fill form fields with existing data", () => {
      render(<WorkHistoryFormDialog {...defaultProps({ workHistory })} />);
      expect(screen.getByDisplayValue("テスト株式会社")).toBeInTheDocument();
      expect(screen.getByDisplayValue("テスト事業")).toBeInTheDocument();
      expect(screen.getByDisplayValue("エンジニア")).toBeInTheDocument();
      expect(screen.getByDisplayValue("開発部")).toBeInTheDocument();
    });
  });

  describe("when the isCurrent switch is toggled", () => {
    it("should disable the end date field when toggled on", async () => {
      const user = userEvent.setup();
      render(<WorkHistoryFormDialog {...defaultProps()} />);

      const switchElement = screen.getByRole("switch");
      await user.click(switchElement);

      const endDateInput = screen.getByPlaceholderText("2024-03");
      expect(endDateInput).toBeDisabled();
    });
  });

  describe("when the form is submitted in create mode", () => {
    it("should POST to /api/work-history", async () => {
      const user = userEvent.setup();
      const props = defaultProps();
      render(<WorkHistoryFormDialog {...props} />);

      const companyInput = screen.getByRole("textbox", { name: "会社名 *" });
      const startDateInput = screen.getByPlaceholderText("2022-04");

      await user.type(companyInput, "テスト企業");
      await user.type(startDateInput, "2023-04");
      await user.click(screen.getByRole("button", { name: "追加" }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/work-history",
          expect.objectContaining({ method: "POST" })
        );
      });
    });
  });

  describe("when the form is submitted in edit mode", () => {
    it("should PATCH to /api/work-history/:id", async () => {
      const user = userEvent.setup();
      const workHistory = {
        id: "test-id",
        companyName: "テスト株式会社",
        companyDescription: null,
        employmentType: null,
        position: null,
        department: null,
        startDate: "2022-04",
        endDate: null,
        isCurrent: false,
        responsibilities: null,
      };
      const props = defaultProps({ workHistory });
      render(<WorkHistoryFormDialog {...props} />);

      await user.click(screen.getByRole("button", { name: "更新" }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/work-history/test-id",
          expect.objectContaining({ method: "PATCH" })
        );
      });
    });
  });

  describe("when the cancel button is clicked", () => {
    it("should call onOpenChange with false", async () => {
      const user = userEvent.setup();
      const props = defaultProps();
      render(<WorkHistoryFormDialog {...props} />);

      await user.click(screen.getByRole("button", { name: "キャンセル" }));
      expect(props.onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});

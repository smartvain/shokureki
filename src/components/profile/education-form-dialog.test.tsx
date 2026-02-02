// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EducationFormDialog } from "./education-form-dialog";

const mockFetch = vi.fn();
global.fetch = mockFetch;

function defaultProps(
  overrides: Partial<Parameters<typeof EducationFormDialog>[0]> = {}
): Parameters<typeof EducationFormDialog>[0] {
  return {
    open: true,
    onOpenChange: vi.fn(),
    onSuccess: vi.fn(),
    ...overrides,
  };
}

describe("EducationFormDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true });
  });

  describe("when opened", () => {
    it("should display the dialog title", () => {
      render(<EducationFormDialog {...defaultProps()} />);
      expect(screen.getByText("学歴を追加")).toBeInTheDocument();
    });

    it("should display form labels", () => {
      render(<EducationFormDialog {...defaultProps()} />);
      expect(screen.getByText("学校名 *")).toBeInTheDocument();
      expect(screen.getByText("学部・学科")).toBeInTheDocument();
      expect(screen.getByText("学位")).toBeInTheDocument();
      expect(screen.getByText("入学年月")).toBeInTheDocument();
      expect(screen.getByText("卒業年月")).toBeInTheDocument();
      expect(screen.getByText("状態")).toBeInTheDocument();
    });

    it("should display the submit button", () => {
      render(<EducationFormDialog {...defaultProps()} />);
      expect(screen.getByRole("button", { name: "追加" })).toBeInTheDocument();
    });
  });

  describe("when the form is submitted with valid data", () => {
    it("should POST to /api/profile/educations", async () => {
      const user = userEvent.setup();
      const props = defaultProps();
      render(<EducationFormDialog {...props} />);

      await user.type(screen.getByPlaceholderText("例: 東京大学"), "慶應義塾大学");
      await user.click(screen.getByRole("button", { name: "追加" }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/profile/educations",
          expect.objectContaining({ method: "POST" })
        );
      });
    });

    it("should call onSuccess after successful submission", async () => {
      const user = userEvent.setup();
      const props = defaultProps();
      render(<EducationFormDialog {...props} />);

      await user.type(screen.getByPlaceholderText("例: 東京大学"), "慶應義塾大学");
      await user.click(screen.getByRole("button", { name: "追加" }));

      await waitFor(() => {
        expect(props.onSuccess).toHaveBeenCalled();
      });
    });
  });

  describe("when the cancel button is clicked", () => {
    it("should call onOpenChange with false", async () => {
      const user = userEvent.setup();
      const props = defaultProps();
      render(<EducationFormDialog {...props} />);

      await user.click(screen.getByRole("button", { name: "キャンセル" }));
      expect(props.onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});

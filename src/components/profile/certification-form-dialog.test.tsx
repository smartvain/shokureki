// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CertificationFormDialog } from "./certification-form-dialog";

const mockFetch = vi.fn();
global.fetch = mockFetch;

function defaultProps(
  overrides: Partial<Parameters<typeof CertificationFormDialog>[0]> = {}
): Parameters<typeof CertificationFormDialog>[0] {
  return {
    open: true,
    onOpenChange: vi.fn(),
    onSuccess: vi.fn(),
    ...overrides,
  };
}

describe("CertificationFormDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true });
  });

  describe("when opened", () => {
    it("should display the dialog title", () => {
      render(<CertificationFormDialog {...defaultProps()} />);
      expect(screen.getByText("資格を追加")).toBeInTheDocument();
    });

    it("should display form labels", () => {
      render(<CertificationFormDialog {...defaultProps()} />);
      expect(screen.getByText("資格名 *")).toBeInTheDocument();
      expect(screen.getByText("発行機関")).toBeInTheDocument();
      expect(screen.getByText("取得日")).toBeInTheDocument();
    });

    it("should display the submit button", () => {
      render(<CertificationFormDialog {...defaultProps()} />);
      expect(screen.getByRole("button", { name: "追加" })).toBeInTheDocument();
    });
  });

  describe("when the form is submitted with valid data", () => {
    it("should POST to /api/profile/certifications", async () => {
      const user = userEvent.setup();
      const props = defaultProps();
      render(<CertificationFormDialog {...props} />);

      await user.type(screen.getByPlaceholderText("例: 基本情報技術者"), "AWS SAA");
      await user.click(screen.getByRole("button", { name: "追加" }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/profile/certifications",
          expect.objectContaining({ method: "POST" })
        );
      });
    });

    it("should call onSuccess after successful submission", async () => {
      const user = userEvent.setup();
      const props = defaultProps();
      render(<CertificationFormDialog {...props} />);

      await user.type(screen.getByPlaceholderText("例: 基本情報技術者"), "AWS SAA");
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
      render(<CertificationFormDialog {...props} />);

      await user.click(screen.getByRole("button", { name: "キャンセル" }));
      expect(props.onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});

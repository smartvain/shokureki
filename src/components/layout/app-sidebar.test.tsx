// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppSidebar } from "./app-sidebar";

const mockSignOut = vi.fn();
const mockSetTheme = vi.fn();
let mockPathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

vi.mock("next-auth/react", () => ({
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: mockSetTheme }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/ui/sidebar", () => ({
  Sidebar: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <aside {...props}>{children}</aside>
  ),
  SidebarContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarGroupContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarGroupLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarHeader: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => <div {...props}>{children}</div>,
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <ul>{children}</ul>,
  SidebarMenuButton: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    asChild?: boolean;
    isActive?: boolean;
    [key: string]: unknown;
  }) => {
    const { asChild: _, isActive: __, ...rest } = props;
    return <li {...rest}>{children}</li>;
  },
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SidebarFooter: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => <div {...props}>{children}</div>,
}));

describe("AppSidebar", () => {
  beforeEach(() => {
    mockPathname = "/";
    vi.clearAllMocks();
  });

  describe("when rendered", () => {
    it("should display the app title", () => {
      render(<AppSidebar />);
      expect(screen.getByText("Shokureki")).toBeInTheDocument();
    });

    it("should display the subtitle", () => {
      render(<AppSidebar />);
      expect(screen.getByText("職務経歴書管理")).toBeInTheDocument();
    });

    it("should display all navigation items", () => {
      render(<AppSidebar />);
      expect(screen.getByText("ダッシュボード")).toBeInTheDocument();
      expect(screen.getByText("実績一覧")).toBeInTheDocument();
      expect(screen.getByText("プロジェクト")).toBeInTheDocument();
      expect(screen.getAllByText("プロフィール").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("職務経歴")).toBeInTheDocument();
      expect(screen.getByText("書類一覧")).toBeInTheDocument();
      expect(screen.getByText("設定")).toBeInTheDocument();
    });

    it("should display section labels", () => {
      render(<AppSidebar />);
      expect(screen.getByText("メイン")).toBeInTheDocument();
      expect(screen.getAllByText("プロフィール").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("書類")).toBeInTheDocument();
    });
  });

  describe("when the user clicks the logout button", () => {
    it("should call signOut", async () => {
      const user = userEvent.setup();
      render(<AppSidebar />);
      await user.click(screen.getByText("ログアウト"));
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe("when the user clicks the theme toggle button", () => {
    it("should toggle the theme to dark", async () => {
      const user = userEvent.setup();
      render(<AppSidebar />);
      await user.click(screen.getByText("テーマ切替"));
      expect(mockSetTheme).toHaveBeenCalledWith("dark");
    });
  });
});

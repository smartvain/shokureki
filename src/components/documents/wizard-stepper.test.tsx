// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { WizardStepper } from "./wizard-stepper";

const steps = [{ label: "基本情報" }, { label: "実績選択" }, { label: "確認" }];

describe("WizardStepper", () => {
  describe("when rendered with steps", () => {
    it("should display all step labels", () => {
      render(<WizardStepper currentStep={0} steps={steps} />);
      expect(screen.getByText("基本情報")).toBeInTheDocument();
      expect(screen.getByText("実績選択")).toBeInTheDocument();
      expect(screen.getByText("確認")).toBeInTheDocument();
    });
  });

  describe("when on the first step", () => {
    it("should display step number 1 for the current step", () => {
      render(<WizardStepper currentStep={0} steps={steps} />);
      expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("should display step numbers for upcoming steps", () => {
      render(<WizardStepper currentStep={0} steps={steps} />);
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("should not display any checkmarks", () => {
      render(<WizardStepper currentStep={0} steps={steps} />);
      expect(screen.queryByText("✓")).not.toBeInTheDocument();
    });
  });

  describe("when on the second step", () => {
    it("should display a checkmark for the completed first step", () => {
      render(<WizardStepper currentStep={1} steps={steps} />);
      expect(screen.getByText("✓")).toBeInTheDocument();
    });

    it("should display the current step number", () => {
      render(<WizardStepper currentStep={1} steps={steps} />);
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("should display the upcoming step number", () => {
      render(<WizardStepper currentStep={1} steps={steps} />);
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });

  describe("when on the last step", () => {
    it("should display checkmarks for all previous steps", () => {
      render(<WizardStepper currentStep={2} steps={steps} />);
      const checkmarks = screen.getAllByText("✓");
      expect(checkmarks).toHaveLength(2);
    });

    it("should display the current step number", () => {
      render(<WizardStepper currentStep={2} steps={steps} />);
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });
});

"use client";

import { cn } from "@/lib/utils";

interface WizardStepperProps {
  currentStep: number;
  steps: { label: string }[];
}

export function WizardStepper({ currentStep, steps }: WizardStepperProps) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium",
                index < currentStep
                  ? "bg-primary text-primary-foreground"
                  : index === currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {index < currentStep ? "✓" : index + 1}
            </div>
            <span
              className={cn(
                "text-sm",
                index <= currentStep
                  ? "font-medium"
                  : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "h-px w-8",
                index < currentStep ? "bg-primary" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

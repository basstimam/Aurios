interface Step {
  label: string
  number: number
}

const DEPOSIT_STEPS: Step[] = [
  { number: 1, label: 'Choose Vault' },
  { number: 2, label: 'Enter Amount' },
  { number: 3, label: 'Preview' },
  { number: 4, label: 'Confirm' },
]

interface StepIndicatorProps {
  currentStep: number
  steps?: Step[]
}

export function StepIndicator({ currentStep, steps = DEPOSIT_STEPS }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, idx) => {
        const isActive = step.number === currentStep
        const isCompleted = step.number < currentStep
        const isLast = idx === steps.length - 1

        return (
          <div key={step.number} className="flex items-center">
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-space-grotesk
                  ${isCompleted ? 'bg-accent-amber text-black' : ''}
                  ${isActive ? 'bg-accent-amber text-black ring-4 ring-accent-amber/20' : ''}
                  ${!isActive && !isCompleted ? 'bg-bg-card border border-border-default text-text-muted' : ''}
                `}
              >
                {isCompleted ? '✓' : step.number}
              </div>
              <span
                className={`
                  text-xs font-inter whitespace-nowrap
                  ${isActive ? 'text-accent-amber font-medium' : ''}
                  ${isCompleted ? 'text-text-secondary' : ''}
                  ${!isActive && !isCompleted ? 'text-text-muted' : ''}
                `}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div
                className={`w-16 h-px mx-1 mb-5 ${isCompleted ? 'bg-accent-amber' : 'bg-border-default'}`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

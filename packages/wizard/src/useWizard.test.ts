import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { WizardStep } from './types';
import { useWizard } from './useWizard';

const steps: WizardStep[] = [
  { key: 'step1', label: 'Step 1', completed: false },
  { key: 'step2', label: 'Step 2', completed: false },
  { key: 'step3', label: 'Step 3', completed: false },
];

describe('useWizard', () => {
  it('initializes at the first step', () => {
    const { result } = renderHook(() => useWizard(steps));

    expect(result.current.step).toBe(steps[0]);
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isFirstStep).toBe(true);
    expect(result.current.isLastStep).toBe(false);
  });

  it('navigates next and back', () => {
    const { result } = renderHook(() => useWizard(steps));

    act(() => {
      result.current.goNext();
    });
    expect(result.current.step).toBe(steps[1]);
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.isFirstStep).toBe(false);
    expect(result.current.isLastStep).toBe(false);

    act(() => {
      result.current.goNext();
    });
    expect(result.current.step).toBe(steps[2]);
    expect(result.current.currentIndex).toBe(2);
    expect(result.current.isFirstStep).toBe(false);
    expect(result.current.isLastStep).toBe(true);

    act(() => {
      result.current.goBack();
    });
    expect(result.current.step).toBe(steps[1]);
    expect(result.current.currentIndex).toBe(1);
  });

  it('normalizes cloned step objects to canonical step references', () => {
    const { result } = renderHook(() => useWizard(steps));

    // Pass a cloned step object with matching key
    act(() => {
      result.current.setStep({
        key: 'step2',
        label: 'Step 2',
        completed: true,
      });
    });

    // Should resolve to the canonical object reference in steps array
    expect(result.current.step).toBe(steps[1]);
    expect(result.current.isFirstStep).toBe(false);
    expect(result.current.isLastStep).toBe(false);

    // Back button should work after setting a cloned step
    act(() => {
      result.current.goBack();
    });
    expect(result.current.step).toBe(steps[0]);
    expect(result.current.isFirstStep).toBe(true);
  });

  it('safely clamps step when steps array shrinks dynamically', () => {
    const { result, rerender } = renderHook(
      ({ currentSteps }) => useWizard(currentSteps),
      { initialProps: { currentSteps: steps } },
    );

    act(() => {
      result.current.setStep(steps[2]);
    });
    expect(result.current.step).toBe(steps[2]);

    // Rerender with shorter steps array
    rerender({ currentSteps: steps.slice(0, 2) });
    expect(result.current.step).toBe(steps[1]);
    expect(result.current.isLastStep).toBe(true);
  });
});

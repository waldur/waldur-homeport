import { XIcon } from '@phosphor-icons/react';
import { screen } from '@testing-library/react';
import { ReactElement, isValidElement } from 'react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { Proposal, ProposalState } from '../../types';

import { ProgressSteps, getSteps } from './ProgressSteps';

/**
 * These tests exercise the state -> steps mapping in getSteps/getSortedSteps.
 *
 * The rendered tests assert against the real `@/wizard` ProgressSteps DOM via
 * accessible queries only (no reaching into @/wizard's internal markup):
 *   - each step is role="listitem" with aria-label={label}
 *   - a completed step gets the CSS class "completed"
 *   - the auto-detected "current" step gets class "current" + aria-current="step"
 *
 * The danger-variant styling (red icon/title, the custom ✕ marker) is decided
 * by `getSteps` itself and rendered by @/wizard from the returned step model.
 * Asserting that styling through @/wizard's CSS classes would couple this test
 * to another component's internals, so we assert it directly on the step model
 * returned by `getSteps` instead.
 */

const makeProposal = (state: ProposalState): Proposal =>
  ({ state }) as Proposal;

/** Returns the listitem (step) whose accessible name (aria-label) matches. */
const getStep = (label: string) =>
  screen.getByRole('listitem', { name: label }) as HTMLElement;

/** Like getStep but returns null instead of throwing when absent. */
const queryStep = (label: string) =>
  screen.queryByRole('listitem', { name: label });

const isCompleted = (step: HTMLElement) => step.classList.contains('completed');
const isCurrent = (step: HTMLElement) => step.classList.contains('current');

describe('proposal create ProgressSteps', () => {
  it('renders three default steps for a draft proposal with none completed', () => {
    renderWithProviders(<ProgressSteps proposal={makeProposal('draft')} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(3);

    const submission = getStep('Submission');
    const review = getStep('Review');
    const decision = getStep('Decision');

    expect(isCompleted(submission)).toBe(false);
    expect(isCompleted(review)).toBe(false);
    expect(isCompleted(decision)).toBe(false);

    // With nothing completed, the first step is auto-detected as current.
    expect(isCurrent(submission)).toBe(true);
    expect(submission.getAttribute('aria-current')).toBe('step');
  });

  it('marks Submission completed and Review current for a submitted proposal', () => {
    renderWithProviders(<ProgressSteps proposal={makeProposal('submitted')} />);

    const submission = getStep('Submission');
    const review = getStep('Review');
    const decision = getStep('Decision');

    expect(isCompleted(submission)).toBe(true);
    expect(isCompleted(review)).toBe(false);
    expect(isCompleted(decision)).toBe(false);

    // Review is the current step: previous step completed, this one not.
    expect(isCurrent(review)).toBe(true);
    expect(review.getAttribute('aria-current')).toBe('step');
  });

  it('behaves identically for in_review as for submitted (shared Review step)', () => {
    renderWithProviders(<ProgressSteps proposal={makeProposal('in_review')} />);

    const submission = getStep('Submission');
    const review = getStep('Review');

    expect(isCompleted(submission)).toBe(true);
    expect(isCompleted(review)).toBe(false);
    expect(isCurrent(review)).toBe(true);
  });

  it('marks Submission and Review completed but NOT Decision for an accepted proposal', () => {
    renderWithProviders(<ProgressSteps proposal={makeProposal('accepted')} />);

    const submission = getStep('Submission');
    const review = getStep('Review');
    const decision = getStep('Decision');

    expect(isCompleted(submission)).toBe(true);
    expect(isCompleted(review)).toBe(true);

    // QUIRK: For an `accepted` proposal the Decision step is NOT marked
    // completed. currentStateIndex = findIndex(Decision) - 1 = 2 - 1 = 1, and a
    // step is completed only when `i <= currentStateIndex`. Decision is at i=2,
    // so 2 <= 1 is false. One would expect a successfully-accepted proposal to
    // show the Decision step as completed (green check), but the off-by-one
    // `- 1` in getSteps leaves it as the "current" step instead.
    expect(isCompleted(decision)).toBe(false);
    expect(isCurrent(decision)).toBe(true);
  });

  it('marks every step including Decision completed for a rejected proposal', () => {
    renderWithProviders(<ProgressSteps proposal={makeProposal('rejected')} />);

    const submission = getStep('Submission');
    const review = getStep('Review');
    const decision = getStep('Decision');

    // Preceding steps are completed (currentStateIndex = 1 for rejected).
    expect(isCompleted(submission)).toBe(true);
    expect(isCompleted(review)).toBe(true);

    // Decision is special-cased as completed (unlike `accepted`, where the
    // off-by-one leaves it merely "current"). The danger styling is asserted
    // on the step model below.
    expect(isCompleted(decision)).toBe(true);
  });

  it('replaces Submission with a danger "Canceled" step for a canceled proposal', () => {
    renderWithProviders(<ProgressSteps proposal={makeProposal('canceled')} />);

    // The first step is now labelled "Canceled" instead of "Submission".
    const canceled = getStep('Canceled');
    expect(queryStep('Submission')).toBeNull();

    // No step is completed (currentStateIndex = -1).
    expect(isCompleted(canceled)).toBe(false);
    expect(isCompleted(getStep('Review'))).toBe(false);
    expect(isCompleted(getStep('Decision'))).toBe(false);

    // As the first uncompleted step it is "current"; combined with the danger
    // variant @/wizard paints the icon and title red. The danger variant is
    // asserted on the step model below.
    expect(isCurrent(canceled)).toBe(true);
  });

  it('keeps Review and Decision labels stable across all states', () => {
    const states: ProposalState[] = [
      'draft',
      'submitted',
      'in_review',
      'accepted',
      'rejected',
      'canceled',
    ];
    for (const state of states) {
      const { unmount } = renderWithProviders(
        <ProgressSteps proposal={makeProposal(state)} />,
      );
      expect(queryStep('Review')).not.toBeNull();
      expect(queryStep('Decision')).not.toBeNull();
      unmount();
    }
  });
});

describe('proposal create getSteps (step model)', () => {
  it('marks the Decision step as a completed danger step with a custom X icon for a rejected proposal', () => {
    const decision = getSteps(makeProposal('rejected'))[2];

    expect(decision).toMatchObject({
      label: 'Decision',
      completed: true,
      variant: 'danger',
      labelClass: 'text-danger',
    });

    // The custom XIcon replaces the default check, signalling failure rather
    // than success at the final step.
    expect(isValidElement(decision.icon)).toBe(true);
    expect((decision.icon as ReactElement).type).toBe(XIcon);
  });

  it('replaces the first step with an uncompleted danger "Canceled" step for a canceled proposal', () => {
    const [first] = getSteps(makeProposal('canceled'));

    expect(first).toMatchObject({
      label: 'Canceled',
      completed: false,
      variant: 'danger',
    });
  });

  it('leaves the default steps without a danger variant for a draft proposal', () => {
    const steps = getSteps(makeProposal('draft'));

    expect(steps.map((step) => step.label)).toEqual([
      'Submission',
      'Review',
      'Decision',
    ]);
    expect(steps.every((step) => step.variant === undefined)).toBe(true);
    expect(steps.every((step) => step.completed === false)).toBe(true);
  });
});

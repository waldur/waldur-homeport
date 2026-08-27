import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MiddleTruncate } from './MiddleTruncate';

const NBSP = '\u00A0';

const renderTruncated = (text: string, tailLength?: number) => {
  render(<MiddleTruncate text={text} tailLength={tailLength} />);
  return {
    head: () => screen.queryByTestId('middle-truncate-head')?.textContent,
    tail: () => screen.queryByTestId('middle-truncate-tail')?.textContent,
    whole: () => screen.queryByTestId('middle-truncate-whole')?.textContent,
  };
};

describe('MiddleTruncate', () => {
  it('renders a short string in one piece', () => {
    const { whole, head } = renderTruncated('Short name');

    expect(whole()).toBe('Short name');
    expect(head()).toBeUndefined();
  });

  it('splits a long string into a shrinking head and a pinned tail', () => {
    const { head, tail } = renderTruncated('abcdefghijklmnopqrstuvwxyz', 12);

    expect(head()).toBe('abcdefghijklmn');
    expect(tail()).toBe('opqrstuvwxyz');
  });

  // The regression this file exists for, and one textContent alone cannot
  // catch: the character was always in the DOM. Whitespace at the boundary
  // between the two inline spans is collapsed by the browser, so "Quantum
  // Error Correction Simulations" *rendered* as "…CorrectionSimulations".
  // A non-breaking space survives that, so assert on the character itself.
  it('keeps the space when the split lands on the tail', () => {
    const { head, tail } = renderTruncated(
      'Quantum Error Correction Simulations',
      12,
    );

    expect(head()).toBe(`Quantum Error Correction${NBSP}`);
    expect(tail()).toBe('Simulations');
  });

  it('keeps the space when the split lands on the head', () => {
    // tailLength chosen so the head, not the tail, carries the space.
    const { head, tail } = renderTruncated('Photonic Quantum Networking', 10);

    expect(head()).toBe(`Photonic Quantum${NBSP}`);
    expect(tail()).toBe('Networking');
  });

  it('leaves a split that lands mid-word alone', () => {
    const { head, tail } = renderTruncated('Photonic Quantum Networking', 12);

    expect(head()?.endsWith(NBSP)).toBe(false);
    expect(`${head()}${tail()}`).toBe('Photonic Quantum Networking');
  });

  it('keeps the untruncated text available as the title', () => {
    render(<MiddleTruncate text="Quantum Error Correction Simulations" />);

    expect(
      screen.getByTitle('Quantum Error Correction Simulations'),
    ).toBeInTheDocument();
  });
});

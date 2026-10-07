/* eslint-disable testing-library/no-node-access -- the box and marks around the input are what these tests check */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Switch } from './Switch';

describe('Switch', () => {
  it('reports the new state through onCheckedChange', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Switch
        checked={false}
        onCheckedChange={onCheckedChange}
        aria-label="Dark"
      />,
    );
    await userEvent.click(screen.getByRole('checkbox', { name: 'Dark' }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('draws the track and knob as elements after an invisible input', () => {
    render(
      <Switch
        checked={false}
        onCheckedChange={() => undefined}
        aria-label="Drawn"
      />,
    );
    const input = screen.getByRole('checkbox');
    expect(input).toHaveClass('peer', 'opacity-0');
    const drawn = input.parentElement.querySelectorAll(
      'span[aria-hidden="true"]',
    );
    expect(drawn).toHaveLength(2);
  });

  it('does not change when disabled', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Switch
        checked={false}
        onCheckedChange={onCheckedChange}
        disabled
        aria-label="Locked"
      />,
    );
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('renders an inline label row with className on it', () => {
    const { container } = render(
      <Switch checked={false} label="Dark theme" className="mb-2" />,
    );
    expect(container.firstChild).toHaveClass('mb-2', 'inline-flex');
  });
});

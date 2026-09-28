import '@testing-library/jest-dom';
import * as Tabs from '@radix-ui/react-tabs';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { SegmentedControl } from './SegmentedControl';
import {
  segmentedItemClassName,
  segmentedListClassName,
} from './segmentedStyles';

const OPTIONS = [
  { value: 'requests', label: 'By request' },
  { value: 'resources', label: 'By resource' },
] as const;

const renderControl = (
  props: Partial<React.ComponentProps<typeof SegmentedControl>> = {},
) => {
  const onValueChange = vi.fn();
  const utils = render(
    <SegmentedControl
      aria-label="Group by"
      options={OPTIONS}
      value="requests"
      onValueChange={onValueChange}
      {...props}
    />,
  );
  return { onValueChange, ...utils };
};

describe('SegmentedControl', () => {
  it('renders one segment per option and marks the selected one', () => {
    renderControl();

    const selected = screen.getByRole('radio', { name: 'By request' });
    const other = screen.getByRole('radio', { name: 'By resource' });
    expect(selected).toHaveAttribute('aria-checked', 'true');
    expect(selected).toHaveAttribute('data-state', 'checked');
    expect(other).toHaveAttribute('aria-checked', 'false');
    expect(other).toHaveAttribute('data-state', 'unchecked');
  });

  it('exposes a radiogroup under its accessible name', () => {
    renderControl();
    expect(
      screen.getByRole('radiogroup', { name: 'Group by' }),
    ).toBeInTheDocument();
  });

  it('reports the newly chosen value', async () => {
    const user = userEvent.setup();
    const { onValueChange } = renderControl();

    await user.click(screen.getByRole('radio', { name: 'By resource' }));

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith('resources');
  });

  it('does nothing when the checked segment is chosen again', async () => {
    const user = userEvent.setup();
    const { onValueChange } = renderControl();

    await user.click(screen.getByRole('radio', { name: 'By request' }));

    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('radio', { name: 'By request' })).toBeChecked();
  });

  it('is controlled: the selection follows `value`, not the click', async () => {
    const user = userEvent.setup();
    renderControl();

    await user.click(screen.getByRole('radio', { name: 'By resource' }));

    // The parent did not update `value`, so nothing moved.
    expect(screen.getByRole('radio', { name: 'By request' })).toHaveAttribute(
      'data-state',
      'checked',
    );
  });

  it('is one tab stop at the checked segment, and the arrow keys select', async () => {
    const user = userEvent.setup();
    const { onValueChange } = renderControl();

    await user.tab();
    const checked = screen.getByRole('radio', { name: 'By request' });
    expect(checked).toHaveFocus();
    expect(checked).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('radio', { name: 'By resource' })).toHaveAttribute(
      'tabindex',
      '-1',
    );

    // Radix checks on focus only while the arrow is held, and moves focus in a
    // timeout; a real press lasts long enough for both, user-event's instant
    // down+up does not.
    await user.keyboard('{ArrowRight>}');
    await waitFor(() =>
      expect(onValueChange).toHaveBeenCalledWith('resources'),
    );
    await user.keyboard('{/ArrowRight}');
    expect(screen.getByRole('radio', { name: 'By resource' })).toHaveFocus();
  });

  it('does not select a disabled segment', async () => {
    const user = userEvent.setup();
    const { onValueChange } = renderControl({
      options: [
        OPTIONS[0],
        { value: 'resources', label: 'By resource', disabled: true },
      ],
    });

    await user.click(screen.getByRole('radio', { name: 'By resource' }));

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('forwards ref to the radiogroup that contains the segments', () => {
    const ref = createRef<HTMLDivElement>();
    renderControl({ ref });

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(screen.getByRole('radiogroup'));
    expect(
      within(ref.current as HTMLElement).getByRole('radio', { checked: true }),
    ).toBe(screen.getByRole('radio', { name: 'By request' }));
  });

  it('stretches segments evenly with fullWidth', () => {
    renderControl({ fullWidth: true });

    expect(screen.getByRole('radiogroup')).toHaveClass('w-full');
    expect(screen.getByRole('radio', { name: 'By request' })).toHaveClass(
      'flex-1',
    );
  });

  // jsdom has no layout, so this pins the class that keeps flexbox's default
  // `align-items: stretch` from resizing the control inside a taller host row.
  it('opts out of being stretched by a flex host', () => {
    renderControl();

    expect(screen.getByRole('radiogroup')).toHaveClass('self-center');
  });

  it('applies itemClassName to every segment, winning over the size padding', () => {
    renderControl({ itemClassName: 'px-6' });

    for (const name of ['By request', 'By resource']) {
      const item = screen.getByRole('radio', { name });
      expect(item).toHaveClass('px-6');
      expect(item).not.toHaveClass('px-[12px]');
    }
  });

  // A switch that owns tab panels (the sign-in form) is Radix Tabs, whose
  // selected segment is `data-state="active"`, not RadioGroup's `checked`.
  it('styles Radix tab triggers with the same segments', () => {
    render(
      <Tabs.Root defaultValue="a">
        <Tabs.List
          aria-label="Method"
          className={segmentedListClassName({ fullWidth: true })}
        >
          <Tabs.Trigger
            value="a"
            className={segmentedItemClassName({ fullWidth: true })}
          >
            A
          </Tabs.Trigger>
          <Tabs.Trigger
            value="b"
            className={segmentedItemClassName({ fullWidth: true })}
          >
            B
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">panel a</Tabs.Content>
      </Tabs.Root>,
    );

    const active = screen.getByRole('tab', { name: 'A' });
    expect(active).toHaveAttribute('data-state', 'active');
    expect(active).toHaveClass(
      'flex-1',
      'data-[state=active]:bg-[var(--btn-tertiary-bg-pressed)]',
    );
    expect(screen.getByRole('tablist')).toHaveClass(
      'flex',
      'w-full',
      'self-center',
    );
  });

  describe('variant', () => {
    it('is neutral by default: tertiary segments, gray selected fill', () => {
      renderControl();

      const item = screen.getByRole('radio', { name: 'By request' });
      expect(item).toHaveClass(
        'bg-[var(--btn-tertiary-bg)]',
        'data-[state=checked]:bg-[var(--btn-tertiary-bg-pressed)]',
      );
      expect(item).not.toHaveClass(
        'data-[state=checked]:bg-[var(--btn-primary-bg)]',
      );
    });

    it('brand: secondary tint segments, solid brand selected fill', () => {
      renderControl({ variant: 'brand' });

      for (const name of ['By request', 'By resource']) {
        const item = screen.getByRole('radio', { name });
        expect(item).toHaveClass(
          'bg-[var(--btn-secondary-bg)]',
          'data-[state=checked]:bg-[var(--btn-primary-bg)]',
          'data-[state=checked]:text-[var(--btn-primary-text)]',
        );
        expect(item).not.toHaveClass(
          'data-[state=checked]:bg-[var(--btn-tertiary-bg-pressed)]',
        );
      }
    });
  });

  describe('numeric values', () => {
    const PERIODS = [
      { value: 0, label: 'All time' },
      { value: 6, label: '6 months' },
      { value: 12, label: '12 months' },
    ];

    it('marks the option whose number matches, including 0', () => {
      render(
        <SegmentedControl
          aria-label="Period"
          options={PERIODS}
          value={0}
          onValueChange={vi.fn()}
        />,
      );

      expect(screen.getByRole('radio', { name: 'All time' })).toBeChecked();
      expect(screen.getByRole('radio', { name: '6 months' })).not.toBeChecked();
    });

    it('reports the chosen value as a number, not a string', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <SegmentedControl
          aria-label="Period"
          options={PERIODS}
          value={0}
          onValueChange={onValueChange}
        />,
      );

      await user.click(screen.getByRole('radio', { name: '12 months' }));

      expect(onValueChange).toHaveBeenCalledWith(12);
      expect(onValueChange).not.toHaveBeenCalledWith('12');
    });
  });

  it('checks nothing when the value matches no option', () => {
    renderControl({ value: '' as never });

    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).not.toBeChecked();
    }
  });
});

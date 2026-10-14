import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StateIndicator } from './StateIndicator';

describe('StateIndicator', () => {
  it('shows no spinner unless active', () => {
    render(<StateIndicator label="Done" variant="success" tone="light" />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  // The spinner inherits the badge's text colour. It used to build
  // `text-${variant}` / `badge-${variant}`: `text-primary` became the neutral
  // text scale's strongest step (near-black), `text-secondary` a gray, and
  // the .badge-* classes no longer exist, which left the spinner brand on a
  // solid brand badge.
  it.each([
    ['primary', 'light'],
    ['primary', 'outline'],
    ['primary', 'solid'],
    ['secondary', 'light'],
    ['danger', 'solid'],
  ] as const)(
    'a %s %s spinner takes the badge text colour',
    (variant, tone) => {
      render(
        <StateIndicator label="Working" variant={variant} tone={tone} active />,
      );
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('text-current');
      // eslint-disable-next-line waldur-custom/no-bootstrap-color-utility -- asserts the old class is gone
      expect(spinner).not.toHaveClass(`text-${variant}`);
      expect(spinner).not.toHaveClass(`badge-${variant}`);
      expect(spinner).not.toHaveClass('text-brand');
    },
  );

  it('title-cases all-caps backend labels but keeps short acronyms', () => {
    render(
      <>
        <StateIndicator label="ACTIVE" variant="success" />
        <StateIndicator label="OK" variant="success" />
      </>,
    );
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
  });
});

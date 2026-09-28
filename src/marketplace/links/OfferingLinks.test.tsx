import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { OfferingDetailsLink } from './OfferingDetailsLink';
import { OfferingLink } from './OfferingLink';

// Both wrappers forward buttonVariant and buttonSize to buttonVariants.
describe.each([
  ['OfferingDetailsLink', OfferingDetailsLink],
  ['OfferingLink', OfferingLink],
])('%s', (_name, Component) => {
  it('renders a small button when buttonSize is sm', () => {
    render(
      <Component
        offering_uuid="o1"
        buttonVariant="text-primary"
        buttonSize="sm"
      >
        Open
      </Component>,
    );

    expect(screen.getByText('Open')).toHaveClass('py-[4px]');
  });

  it('is md when no size is given', () => {
    render(
      <Component offering_uuid="o1" buttonVariant="text-primary">
        Open
      </Component>,
    );

    expect(screen.getByText('Open')).toHaveClass('py-[8px]');
  });

  it('renders a square small button with buttonIconOnly', () => {
    render(
      <Component
        offering_uuid="o1"
        buttonVariant="text-primary"
        buttonSize="sm"
        buttonIconOnly
      >
        +
      </Component>,
    );

    expect(screen.getByText('+')).toHaveClass('h-[28px]', 'w-[28px]');
  });
});

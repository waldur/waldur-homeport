import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { useUser } from '@/workspace/hooks';

import { OfferingDetailsLink } from './OfferingDetailsLink';
import { OfferingLink } from './OfferingLink';

vi.mock('@/features/connect', () => ({
  isFeatureVisible: vi.fn(() => false),
}));

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

describe('OfferingDetailsLink when the shop is hidden', () => {
  beforeEach(() => {
    vi.mocked(useUser).mockReturnValue({ is_staff: false } as any);
  });

  afterEach(() => {
    vi.mocked(isFeatureVisible).mockReset();
    vi.mocked(isFeatureVisible).mockReturnValue(false);
  });

  it('links to the public offering page when shop UI is available', () => {
    render(<OfferingDetailsLink offering_uuid="o1">HPC</OfferingDetailsLink>);
    expect(screen.getByRole('link', { name: 'HPC' })).toBeInTheDocument();
  });

  it('shows plain text when hide_marketplace_from_end_users is on for non-staff', () => {
    vi.mocked(isFeatureVisible).mockImplementation(
      (key) => key === MarketplaceFeatures.hide_marketplace_from_end_users,
    );
    render(<OfferingDetailsLink offering_uuid="o1">HPC</OfferingDetailsLink>);
    expect(screen.getByText('HPC')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'HPC' })).toBeNull();
  });

  it.each([
    ['staff', { is_staff: true, is_support: false }],
    ['support', { is_staff: false, is_support: true }],
  ])(
    'links when hide_marketplace_from_end_users is on for %s',
    (_label, role) => {
      vi.mocked(isFeatureVisible).mockImplementation(
        (key) => key === MarketplaceFeatures.hide_marketplace_from_end_users,
      );
      vi.mocked(useUser).mockReturnValue(role as any);
      render(<OfferingDetailsLink offering_uuid="o1">HPC</OfferingDetailsLink>);
      render(<OfferingLink offering_uuid="o1">Deploy</OfferingLink>);
      expect(screen.getByRole('link', { name: 'HPC' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Deploy' })).toBeInTheDocument();
    },
  );

  it('drops the deploy link for a project member when the shop is hidden', () => {
    vi.mocked(isFeatureVisible).mockImplementation(
      (key) => key === MarketplaceFeatures.hide_marketplace_from_end_users,
    );
    render(<OfferingLink offering_uuid="o1">Deploy</OfferingLink>);
    expect(screen.getByText('Deploy')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Deploy' })).toBeNull();
  });
});

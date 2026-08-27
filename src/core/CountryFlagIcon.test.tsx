import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CountryFlagIcon } from './CountryFlagIcon';

describe('CountryFlagIcon', () => {
  it('renders a flag class for a known country code', () => {
    render(<CountryFlagIcon countryCode="hr" />);
    expect(screen.getByTestId('country-flag')).toHaveClass('flag-hr');
  });

  it('lowercases the country code', () => {
    render(<CountryFlagIcon countryCode="GB" />);
    expect(screen.getByTestId('country-flag')).toHaveClass('flag-gb');
  });

  // Callers map from another domain (language code -> country) and can hand us
  // undefined for a code they have no entry for. That used to throw inside
  // toLowerCase and take the whole enclosing layout down — see the language
  // selector in the authenticated header.
  it('renders nothing instead of throwing when the code is missing', () => {
    expect(() =>
      render(<CountryFlagIcon countryCode={undefined} />),
    ).not.toThrow();
    expect(screen.queryByTestId('country-flag')).toBeNull();
  });
});

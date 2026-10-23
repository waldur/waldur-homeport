import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FieldWarning } from './FieldWarning';

describe('FieldWarning', () => {
  it('is a polite status, not an alert', () => {
    render(<FieldWarning error="Looks unusual" />);
    expect(screen.getByRole('status')).toHaveTextContent('Looks unusual');
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

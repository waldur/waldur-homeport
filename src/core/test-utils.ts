import { screen, waitFor } from '@testing-library/react';
import { expect } from 'vitest';

export const waitForSpinner = () =>
  waitFor(() =>
    expect(screen.queryByTestId('SpinnerIcon')).not.toBeInTheDocument(),
  );

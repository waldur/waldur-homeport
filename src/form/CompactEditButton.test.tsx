import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CompactEditButton } from './CompactEditButton';

describe('CompactEditButton', () => {
  it('renders default icon when no iconNode is provided', () => {
    render(<CompactEditButton onClick={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByTestId('compact-edit-button')).toBeInTheDocument();
  });

  it('renders custom iconNode when provided', () => {
    const customIcon = <div data-testid="custom-compact-icon">Lock</div>;
    render(<CompactEditButton onClick={() => {}} iconNode={customIcon} />);

    expect(screen.getByTestId('custom-compact-icon')).toBeInTheDocument();
    expect(screen.getByTestId('compact-edit-button')).toBeInTheDocument();
  });

  it('propagates tooltip prop correctly', () => {
    render(<CompactEditButton onClick={() => {}} tooltip="Edit this field" />);
    expect(
      screen.getByRole('button', { name: /Edit this field/i }),
    ).toBeInTheDocument();
  });
});

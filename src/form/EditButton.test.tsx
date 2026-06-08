import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CompactEditButton } from './CompactEditButton';
import { EditButton } from './EditButton';

describe('EditButton', () => {
  it('renders default icon when no iconNode is provided', () => {
    render(<EditButton onClick={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders custom iconNode when provided', () => {
    const customIcon = <div data-testid="custom-icon">Lock</div>;
    render(<EditButton onClick={() => {}} iconNode={customIcon} />);

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(screen.getByTestId('custom-icon')).toHaveTextContent('Lock');
  });

  it('propagates tooltip prop correctly', () => {
    render(<EditButton onClick={() => {}} tooltip="Edit this field" />);
    expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
  });
});

describe('CompactEditButton', () => {
  it('renders as btnIcon with size sm and passes iconNode down', () => {
    const customIcon = <div data-testid="custom-compact-icon">Lock</div>;
    render(<CompactEditButton onClick={() => {}} iconNode={customIcon} />);

    expect(screen.getByTestId('custom-compact-icon')).toBeInTheDocument();
    expect(screen.getByTestId('compact-edit-button')).toBeInTheDocument();
  });
});

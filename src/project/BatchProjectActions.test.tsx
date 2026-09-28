import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BatchProjectActions } from './BatchProjectActions';

// ExpandableRowToolbar forwards size="md" so the dropdown toggle matches 36px buttons.
describe('BatchProjectActions', () => {
  it('forwards size to its dropdown toggle', () => {
    render(
      <BatchProjectActions rows={[]} refetch={() => undefined} size="md" />,
    );

    expect(screen.getByRole('button', { name: /All actions/ })).toHaveClass(
      'py-[8px]',
    );
  });

  it('is large by default', () => {
    render(<BatchProjectActions rows={[]} refetch={() => undefined} />);

    expect(screen.getByRole('button', { name: /All actions/ })).toHaveClass(
      'py-[10px]',
    );
  });
});

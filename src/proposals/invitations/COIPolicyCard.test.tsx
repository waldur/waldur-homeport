import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { COIPolicyCard } from './COIPolicyCard';

describe('COIPolicyCard', () => {
  it('renders nothing for a call without conflict types', () => {
    const { container } = render(
      <COIPolicyCard
        config={
          {
            recusal_required_types: [],
            management_allowed_types: [],
            disclosure_only_types: [],
          } as any
        }
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  // Nothing in the UI takes a declared conflict: an assigned reviewer
  // declines the proposal instead, so the card says that.
  it('tells the reviewer to decline a conflicted assignment', () => {
    render(
      <COIPolicyCard
        config={{ recusal_required_types: ['COAUTH_RECENT'] } as any}
      />,
    );
    expect(
      screen.getByText(/decline any you have a conflict with/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/asked to declare/)).not.toBeInTheDocument();
  });
});

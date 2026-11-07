import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { OwnOfferingsNote } from './OwnOfferingsNote';

describe('OwnOfferingsNote', () => {
  it("tells a provider that other providers' requests are not shown", () => {
    render(<OwnOfferingsNote proposal={{ reads_own_offerings_only: true }} />);
    expect(
      screen.getByText(/Only your offerings' part is shown/),
    ).toBeInTheDocument();
  });

  it('is absent for whoever reads the whole proposal', () => {
    const { container } = render(
      <OwnOfferingsNote proposal={{ reads_own_offerings_only: false }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

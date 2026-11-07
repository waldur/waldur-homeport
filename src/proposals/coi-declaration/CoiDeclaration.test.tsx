import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CoiDeclaration } from './CoiDeclaration';

describe('CoiDeclaration', () => {
  it("shows the call's own wording", () => {
    render(
      <CoiDeclaration
        text={'No ties to the applicants.\nNone in the last 3 years.'}
        fallback="Standard declaration"
      />,
    );
    expect(screen.getByTestId('coi-declaration').textContent).toContain(
      'No ties to the applicants.',
    );
    expect(screen.queryByText('Standard declaration')).toBeNull();
  });

  it("falls back to the platform's declaration", () => {
    render(<CoiDeclaration text="  " fallback="Standard declaration" />);
    expect(screen.getByText('Standard declaration')).toBeTruthy();
    expect(screen.queryByTestId('coi-declaration')).toBeNull();
  });
});

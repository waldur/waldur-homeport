import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Field } from './Field';

describe('Field', () => {
  it('shows the label with a colon and the value', () => {
    render(<Field label="Region" value="eu-north-1" />);

    expect(screen.getByText('Region:')).toBeInTheDocument();
    expect(screen.getByText('eu-north-1')).toBeInTheDocument();
  });

  it('shows children when there is no value', () => {
    render(
      <Field label="Plan">
        <span>Enterprise</span>
      </Field>,
    );

    expect(screen.getByText('Enterprise')).toBeInTheDocument();
  });

  it('shows 0 as a value', () => {
    render(<Field label="Matched resources" value={0} />);

    expect(screen.getByText('Matched resources:')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it.each([undefined, null, '', false])(
    'leaves the row out when the value is %s',
    (value) => {
      const { container } = render(<Field label="Region" value={value} />);

      expect(container).toBeEmptyDOMElement();
    },
  );
});

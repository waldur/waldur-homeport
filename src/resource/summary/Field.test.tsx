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

  // Stuck value shares the row beside the label instead of wrapping under it.
  it('keeps a stuck value beside its label', () => {
    render(<Field label="State" value="OK" isStuck />);

    expect(screen.getByText('OK')).toHaveClass('flex-1');
    expect(screen.getByText('OK')).not.toHaveClass('w-full');
  });

  it('gives label and value their twelfths from sm up', () => {
    render(<Field label="State" value="OK" labelCol={4} valueCol={8} />);

    expect(screen.getByText('State:')).toHaveClass('w-full', 'sm:w-4/12');
    expect(screen.getByText('OK')).toHaveClass('w-full', 'sm:w-8/12');
  });
});

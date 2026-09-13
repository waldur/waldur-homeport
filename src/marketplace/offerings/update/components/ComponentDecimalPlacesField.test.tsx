import { render, screen } from '@testing-library/react';
import { Form } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';

import { ComponentDecimalPlacesField } from './ComponentDecimalPlacesField';

const ADVISORY =
  'This offering is served by a site agent reporting backend slurm, which ' +
  'stores limits as whole numbers.';

const renderField = ({
  advisory,
  places,
}: { advisory?: string | null; places?: number } = {}) =>
  render(
    <Form
      onSubmit={vi.fn()}
      initialValues={{ limit_decimal_places: places }}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <ComponentDecimalPlacesField
            offering={
              advisory === undefined
                ? undefined
                : ({ limit_precision_advisory: advisory } as any)
            }
          />
        </form>
      )}
    />,
  );

describe('ComponentDecimalPlacesField', () => {
  it('always offers the field itself', () => {
    renderField();
    expect(screen.getByLabelText(/Decimal places/i)).toBeInTheDocument();
  });

  // The backend phrases the sentence -- it knows which agent backends store
  // whole numbers -- so the component renders whatever arrives rather than
  // holding that list itself.
  it('shows the advisory the backend sent once a fraction is asked for', () => {
    renderField({ advisory: ADVISORY, places: 2 });
    expect(screen.getByText(ADVISORY)).toBeInTheDocument();
  });

  it('stays quiet while the component is whole-number only', () => {
    renderField({ advisory: ADVISORY, places: 0 });
    expect(screen.queryByText(ADVISORY)).not.toBeInTheDocument();
  });

  it('stays quiet when the precision has not been set at all', () => {
    renderField({ advisory: ADVISORY });
    expect(screen.queryByText(ADVISORY)).not.toBeInTheDocument();
  });

  it('stays quiet when the backend has nothing to say', () => {
    renderField({ advisory: null, places: 2 });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText(ADVISORY)).not.toBeInTheDocument();
  });

  it('stays quiet when there is no offering in context', () => {
    renderField({ places: 2 });
    expect(screen.queryByText(ADVISORY)).not.toBeInTheDocument();
  });
});

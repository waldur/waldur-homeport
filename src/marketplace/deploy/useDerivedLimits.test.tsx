import { act, render, waitFor } from '@testing-library/react';
import { FC } from 'react';
import { Form } from 'react-final-form';
import { describe, expect, it } from 'vitest';

import { useDefaultLimits } from './useDefaultLimits';
import { useDerivedLimits } from './useDerivedLimits';

const offering: any = {
  uuid: 'offering-1',
  type: 'Marketplace.Basic',
  components: [
    { type: 'data', billing_type: 'limit', default_limit: 1 },
    { type: 'wal', billing_type: 'limit', limit_decimal_places: 1 },
    { type: 'backup', billing_type: 'limit' },
    { type: 'extra', billing_type: 'limit' },
  ],
  options: {
    order: ['storage', 'backup'],
    options: {
      storage: {
        type: 'component_formula',
        label: 'Storage',
        component_formula_config: {
          targets: [
            { component_type: 'data', formula: 'input * 2' },
            { component_type: 'wal', formula: 'input / 3' },
          ],
        },
      },
      backup: {
        type: 'component_sum',
        label: 'Backup',
        component_sum_config: {
          target_component: 'backup',
          components: ['data', 'wal', 'extra'],
        },
      },
    },
  },
};

const Probe: FC = () => {
  useDefaultLimits({ offering });
  useDerivedLimits(offering);
  return null;
};

const renderForm = (initialValues = {}) => {
  let form: any;
  const utils = render(
    <Form
      onSubmit={() => undefined}
      initialValues={initialValues}
      subscription={{ values: true }}
      render={({ form: formApi }) => {
        form = formApi;
        return <Probe />;
      }}
    />,
  );
  return { ...utils, getForm: () => form };
};

describe('useDerivedLimits', () => {
  it('writes the derived limits once the input is entered', async () => {
    const { getForm } = renderForm();
    // Without an input the default limit of a derived component is cleared.
    await waitFor(() =>
      expect(getForm().getState().values.limits?.data).toBeUndefined(),
    );

    act(() => {
      getForm().change('limits.extra', 5);
      getForm().change('attributes.storage', 10);
    });

    await waitFor(() =>
      expect(getForm().getState().values.limits).toEqual({
        data: 20,
        wal: 3.4,
        // 20 + 3.4 + 5, rounded up: backup takes whole numbers only.
        backup: 29,
        extra: 5,
      }),
    );
  });

  it('puts back a derived value typed over', async () => {
    const { getForm } = renderForm({ attributes: { storage: 10 } });
    await waitFor(() =>
      expect(getForm().getState().values.limits?.data).toBe(20),
    );

    act(() => {
      getForm().change('limits.data', 1);
    });

    await waitFor(() =>
      expect(getForm().getState().values.limits?.data).toBe(20),
    );
  });
});

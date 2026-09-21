import { act, render, waitFor } from '@testing-library/react';
import { FC } from 'react';
import { Field, Form } from 'react-final-form';
import { describe, expect, it } from 'vitest';

import { useDefaultLimits } from './useDefaultLimits';

const offering: any = {
  uuid: 'offering-1',
  type: 'Test.Offering',
  components: [
    { type: 'cpu', billing_type: 'limit', default_limit: 2800 },
    { type: 'storage', billing_type: 'limit', min_value: 2 },
  ],
};

const Probe: FC<{
  offering?: any;
  skip?: boolean;
  onValues: (values) => void;
}> = (props) => {
  useDefaultLimits({ offering: props.offering, skip: props.skip });
  return null;
};

const renderForm = (props: { offering?: any; skip?: boolean } = {}) => {
  let values: any;
  const utils = render(
    <Form
      onSubmit={() => undefined}
      subscription={{ values: true }}
      render={({ values: formValues }) => {
        values = formValues;
        return (
          <Probe
            offering={props.offering ?? offering}
            skip={props.skip}
            onValues={() => undefined}
          />
        );
      }}
    />,
  );
  return { ...utils, getValues: () => values };
};

describe('useDefaultLimits', () => {
  it('seeds the offering default and minimum limits', async () => {
    const { getValues } = renderForm();

    await waitFor(() =>
      expect(getValues().limits).toEqual({ cpu: 2800, storage: 2 }),
    );
  });

  it('seeds nothing in edit mode', async () => {
    const { getValues } = renderForm({ skip: true });

    await waitFor(() => expect(getValues().limits).toBeUndefined());
  });

  it('re-seeds the defaults after the form is reinitialised', async () => {
    // Choosing the project hands <Form> a new initialValues object, which drops
    // the limits while the offering stays the same -- see the hook's comment.
    let values: any;
    const Wrapper: FC<{ initialValues: any }> = ({ initialValues }) => (
      <Form
        onSubmit={() => undefined}
        initialValues={initialValues}
        subscription={{ values: true }}
        render={({ values: formValues }) => {
          values = formValues;
          return <Probe offering={offering} onValues={() => undefined} />;
        }}
      />
    );

    const { rerender } = render(<Wrapper initialValues={{ customer: 'a' }} />);
    await waitFor(() =>
      expect(values.limits).toEqual({ cpu: 2800, storage: 2 }),
    );

    rerender(<Wrapper initialValues={{ customer: 'a', project: 'p' }} />);

    await waitFor(() =>
      expect(values.limits).toEqual({ cpu: 2800, storage: 2 }),
    );
  });

  it('keeps limits the user has already changed', async () => {
    let values: any;
    const Wrapper: FC<{ initialValues: any }> = ({ initialValues }) => (
      <Form
        onSubmit={() => undefined}
        initialValues={initialValues}
        subscription={{ values: true }}
        render={({ values: formValues }) => {
          values = formValues;
          return <Probe offering={offering} onValues={() => undefined} />;
        }}
      />
    );

    render(<Wrapper initialValues={{ limits: { cpu: 5 } }} />);

    await waitFor(() => expect(values.limits).toEqual({ cpu: 5, storage: 2 }));
  });

  it('keeps the plan and edited limits when the form is reinitialised', async () => {
    // Mirrors DeployPage: registered fields, keepDirtyOnReinitialize, and a
    // new initialValues object once the project is chosen.
    let form: any;
    const Wrapper: FC<{ initialValues: any }> = ({ initialValues }) => (
      <Form
        onSubmit={() => undefined}
        initialValues={initialValues}
        keepDirtyOnReinitialize
        subscription={{ values: true }}
        render={({ form: formApi }) => {
          form = formApi;
          return (
            <>
              <Probe offering={offering} onValues={() => undefined} />
              <Field name="plan" component="input" />
              <Field name="limits.cpu" component="input" />
              <Field name="limits.storage" component="input" />
            </>
          );
        }}
      />
    );

    const { rerender } = render(<Wrapper initialValues={{ customer: 'a' }} />);
    await waitFor(() =>
      expect(form.getState().values.limits).toEqual({ cpu: 2800, storage: 2 }),
    );
    act(() => {
      form.change('plan', 'plan-1');
      form.change('limits.cpu', 42);
    });

    rerender(<Wrapper initialValues={{ customer: 'a', project: 'p' }} />);

    await waitFor(() => {
      const values = form.getState().values;
      expect(values.project).toBe('p');
      expect(values.plan).toBe('plan-1');
      expect(values.limits).toEqual({ cpu: 42, storage: 2 });
    });
  });
});

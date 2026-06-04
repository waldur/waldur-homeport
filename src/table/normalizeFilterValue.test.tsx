import { render, waitFor } from '@testing-library/react';
import { FC } from 'react';
import { Form } from 'react-final-form';
import { describe, it, expect } from 'vitest';

import { useNormalizeSelectFilterValue } from './normalizeFilterValue';

const OPTIONS = [
  { value: 'OK', label: 'OK' },
  { value: 'Erred', label: 'Erred' },
];

interface ProbeProps {
  name: string;
  isMulti: boolean;
  options?: any;
}

const Probe: FC<ProbeProps> = ({ name, isMulti, options }) => {
  useNormalizeSelectFilterValue(name, isMulti, options);
  return null;
};

const renderWithForm = (
  initialValues: any,
  probeProps: ProbeProps,
): (() => any) => {
  const captured: { values: any } = { values: undefined };
  render(
    <Form
      onSubmit={() => undefined}
      initialValues={initialValues}
      subscription={{ values: true }}
    >
      {({ values }) => {
        captured.values = values;
        return <Probe {...probeProps} />;
      }}
    </Form>,
  );
  return () => captured.values;
};

describe('useNormalizeSelectFilterValue', () => {
  describe('non-multi (single-select)', () => {
    it('takes first element of an array', async () => {
      const getValues = renderWithForm(
        { state: [{ value: 'done', label: 'Done' }] },
        { name: 'state', isMulti: false },
      );
      await waitFor(() => {
        expect(getValues().state).toEqual({ value: 'done', label: 'Done' });
      });
    });

    it('drops an empty array to null', async () => {
      const getValues = renderWithForm(
        { state: [] },
        { name: 'state', isMulti: false },
      );
      await waitFor(() => {
        expect(getValues().state).toBeNull();
      });
    });

    it('resolves a known raw string against options', async () => {
      const getValues = renderWithForm(
        { state: 'OK' },
        { name: 'state', isMulti: false, options: OPTIONS },
      );
      await waitFor(() => {
        expect(getValues().state).toEqual({ value: 'OK', label: 'OK' });
      });
    });

    it('resolves a known raw string against a thunk-options', async () => {
      const getValues = renderWithForm(
        { state: 'Erred' },
        { name: 'state', isMulti: false, options: () => OPTIONS },
      );
      await waitFor(() => {
        expect(getValues().state).toEqual({ value: 'Erred', label: 'Erred' });
      });
    });

    it('drops an unknown raw string when options are static', async () => {
      const getValues = renderWithForm(
        { state: 'garbage' },
        { name: 'state', isMulti: false, options: OPTIONS },
      );
      await waitFor(() => {
        expect(getValues().state).toBeNull();
      });
    });

    it('drops a raw string when no options are provided', async () => {
      const getValues = renderWithForm(
        { state: 'OK' },
        { name: 'state', isMulti: false },
      );
      await waitFor(() => {
        expect(getValues().state).toBeNull();
      });
    });

    it('leaves an already-correct option object untouched', async () => {
      const correct = { value: 'OK', label: 'OK' };
      const getValues = renderWithForm(
        { state: correct },
        { name: 'state', isMulti: false, options: OPTIONS },
      );
      // Wait a tick for any effects to settle.
      await waitFor(() => {
        expect(getValues().state).toBe(correct);
      });
    });

    it('leaves null untouched', async () => {
      const getValues = renderWithForm(
        { state: null },
        { name: 'state', isMulti: false, options: OPTIONS },
      );
      await waitFor(() => {
        expect(getValues().state).toBeNull();
      });
    });
  });

  describe('multi-select', () => {
    it('wraps a single option object into an array', async () => {
      const getValues = renderWithForm(
        { state: { value: 'OK', label: 'OK' } },
        { name: 'state', isMulti: true },
      );
      await waitFor(() => {
        expect(getValues().state).toEqual([{ value: 'OK', label: 'OK' }]);
      });
    });

    it('wraps a resolved raw string into an array', async () => {
      const getValues = renderWithForm(
        { state: 'OK' },
        { name: 'state', isMulti: true, options: OPTIONS },
      );
      await waitFor(() => {
        expect(getValues().state).toEqual([{ value: 'OK', label: 'OK' }]);
      });
    });

    it('drops an unknown raw string', async () => {
      const getValues = renderWithForm(
        { state: 'garbage' },
        { name: 'state', isMulti: true, options: OPTIONS },
      );
      await waitFor(() => {
        expect(getValues().state).toBeNull();
      });
    });

    it('leaves an existing array untouched', async () => {
      const correct = [{ value: 'OK', label: 'OK' }];
      const getValues = renderWithForm(
        { state: correct },
        { name: 'state', isMulti: true, options: OPTIONS },
      );
      await waitFor(() => {
        expect(getValues().state).toBe(correct);
      });
    });
  });
});

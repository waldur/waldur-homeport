import { render, waitFor } from '@testing-library/react';
import { FC } from 'react';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import { describe, it, expect } from 'vitest';

import { TableFilterContext } from './FilterContextProvider';
import { useNormalizeSelectFilterValue } from './normalizeFilterValue';
import { getTableState } from './selectors';
import { tableInitialReducer } from './store';

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

const renderWithRedux = (
  initialValue: any,
  probeProps: ProbeProps,
): (() => any) => {
  const table = 'testTable';
  const rootReducer = combineReducers({
    tables: tableInitialReducer,
  });
  const store = createStore(rootReducer, {
    tables: {
      [table]: {
        filtersStorage:
          initialValue !== undefined && initialValue !== null
            ? [
                {
                  name: probeProps.name,
                  value: initialValue,
                  label: null,
                  component: null,
                },
              ]
            : [],
        activeColumns: {},
        columnPositions: [],
      },
    },
  } as any);

  render(
    <Provider store={store}>
      <TableFilterContext.Provider
        value={{
          table,
          filterPosition: 'menu',
          form: 'testForm',
          setFilter: (item) =>
            store.dispatch({
              type: 'waldur/table/SET_FILTER',
              payload: { table, item },
            }),
        }}
      >
        <Probe {...probeProps} />
      </TableFilterContext.Provider>
    </Provider>,
  );

  return () => {
    const tableState = getTableState(table)(store.getState() as any);
    const filterItem = tableState?.filtersStorage?.find(
      (f) => f.name === probeProps.name,
    );
    return { [probeProps.name]: filterItem ? filterItem.value : null };
  };
};

describe('useNormalizeSelectFilterValue', () => {
  describe('non-multi (single-select)', () => {
    it('takes first element of an array', async () => {
      const getValues = renderWithRedux([{ value: 'done', label: 'Done' }], {
        name: 'state',
        isMulti: false,
      });
      await waitFor(() => {
        expect(getValues().state).toEqual({ value: 'done', label: 'Done' });
      });
    });

    it('drops an empty array to null', async () => {
      const getValues = renderWithRedux([], { name: 'state', isMulti: false });
      await waitFor(() => {
        expect(getValues().state).toBeNull();
      });
    });

    it('resolves a known raw string against options', async () => {
      const getValues = renderWithRedux('OK', {
        name: 'state',
        isMulti: false,
        options: OPTIONS,
      });
      await waitFor(() => {
        expect(getValues().state).toEqual({ value: 'OK', label: 'OK' });
      });
    });

    it('resolves a known raw string against a thunk-options', async () => {
      const getValues = renderWithRedux('Erred', {
        name: 'state',
        isMulti: false,
        options: () => OPTIONS,
      });
      await waitFor(() => {
        expect(getValues().state).toEqual({ value: 'Erred', label: 'Erred' });
      });
    });

    it('drops an unknown raw string when options are static', async () => {
      const getValues = renderWithRedux('garbage', {
        name: 'state',
        isMulti: false,
        options: OPTIONS,
      });
      await waitFor(() => {
        expect(getValues().state).toBeNull();
      });
    });

    it('drops a raw string when no options are provided', async () => {
      const getValues = renderWithRedux('OK', {
        name: 'state',
        isMulti: false,
      });
      await waitFor(() => {
        expect(getValues().state).toBeNull();
      });
    });

    it('leaves an already-correct option object untouched', async () => {
      const correct = { value: 'OK', label: 'OK' };
      const getValues = renderWithRedux(correct, {
        name: 'state',
        isMulti: false,
        options: OPTIONS,
      });
      await waitFor(() => {
        expect(getValues().state).toEqual(correct);
      });
    });

    it('leaves null untouched', async () => {
      const getValues = renderWithRedux(null, {
        name: 'state',
        isMulti: false,
        options: OPTIONS,
      });
      await waitFor(() => {
        expect(getValues().state).toBeNull();
      });
    });
  });

  describe('multi-select', () => {
    it('wraps a single option object into an array', async () => {
      const getValues = renderWithRedux(
        { value: 'OK', label: 'OK' },
        { name: 'state', isMulti: true },
      );
      await waitFor(() => {
        expect(getValues().state).toEqual([{ value: 'OK', label: 'OK' }]);
      });
    });

    it('wraps a resolved raw string into an array', async () => {
      const getValues = renderWithRedux('OK', {
        name: 'state',
        isMulti: true,
        options: OPTIONS,
      });
      await waitFor(() => {
        expect(getValues().state).toEqual([{ value: 'OK', label: 'OK' }]);
      });
    });

    it('drops an unknown raw string', async () => {
      const getValues = renderWithRedux('garbage', {
        name: 'state',
        isMulti: true,
        options: OPTIONS,
      });
      await waitFor(() => {
        expect(getValues().state).toBeNull();
      });
    });

    it('leaves an existing array untouched', async () => {
      const correct = [{ value: 'OK', label: 'OK' }];
      const getValues = renderWithRedux(correct, {
        name: 'state',
        isMulti: true,
        options: OPTIONS,
      });
      await waitFor(() => {
        expect(getValues().state).toEqual(correct);
      });
    });
  });
});

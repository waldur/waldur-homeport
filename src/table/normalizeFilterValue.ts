import { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setFilter } from './actions';
import { TableFilterContext } from './FilterContextProvider';
import { selectFilterValue } from './selectors';

interface OptionLike {
  value: any;
  label?: any;
}

type OptionsArg = OptionLike[] | (() => OptionLike[]) | undefined;

const resolveOptions = (options: OptionsArg): OptionLike[] | undefined => {
  if (!options) return undefined;
  return typeof options === 'function' ? options() : options;
};

const resolveScalar = (
  raw: string | number,
  options: OptionLike[] | undefined,
): OptionLike | null => {
  if (!options) return null;
  return options.find((o) => o.value === raw) ?? null;
};

/**
 * Coerces a SelectFilter form value into the shape its `isMulti` flag expects.
 *
 * Without this, a single-select filter that lands with an array (e.g. URL
 * crafted in multi-select shape, or a saved filter restored after the filter
 * was reconfigured) renders an empty chip, leaves the active-filter counter
 * incremented, and silently drops the parameter from the API call. A raw
 * string that does not match any known option is dropped instead of leaking
 * a literal value into the chip.
 */
export const useNormalizeSelectFilterValue = (
  name: string,
  isMulti: boolean,
  options?: OptionsArg,
): void => {
  const { table } = useContext(TableFilterContext);
  const dispatch = useDispatch();
  const raw = useSelector(selectFilterValue(table, name));

  useEffect(() => {
    if (raw == null) return;

    let normalized: any;
    if (isMulti) {
      if (Array.isArray(raw)) return;
      if (typeof raw === 'object') {
        normalized = [raw];
      } else if (typeof raw === 'string' || typeof raw === 'number') {
        const resolved = resolveScalar(raw, resolveOptions(options));
        normalized = resolved ? [resolved] : null;
      } else {
        return;
      }
    } else {
      if (Array.isArray(raw)) {
        normalized = raw.length ? raw[0] : null;
      } else if (typeof raw === 'string' || typeof raw === 'number') {
        normalized = resolveScalar(raw, resolveOptions(options));
      } else {
        return;
      }
    }

    dispatch(
      setFilter(table, {
        name,
        value: normalized,
        label: null,
        component: null,
      }),
    );
  }, [raw, isMulti, name, dispatch, table, options]);
};

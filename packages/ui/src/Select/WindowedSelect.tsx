import { FC, useMemo } from 'react';
import BaseSelect from 'react-select';

import { getSelectTailwindClassNames } from './tailwindStyles';
import { CustomSelectProps } from './types';
import { useSelect } from './useSelect';
import { VirtualMenuList } from './VirtualMenuList';

const DEFAULT_WINDOW_THRESHOLD = 100;

interface WindowedSelectProps extends CustomSelectProps {
  /**
   * Switch to virtualized rendering once the total option count meets this
   * threshold. Matches the default behaviour of react-windowed-select.
   */
  windowThreshold?: number;
}

const countOptions = (options: unknown): number => {
  if (!Array.isArray(options)) return 0;
  const first = options[0] as { options?: unknown[] } | undefined;
  if (first && Array.isArray(first.options)) {
    return (options as Array<{ options?: unknown[] }>).reduce(
      (sum, group) => sum + (group.options?.length ?? 0),
      0,
    );
  }
  return options.length;
};

/**
 * A Select that virtualizes its menu once the list is long (countries, time
 * zones). Everything else — label linking, disabled, multi-select defaults,
 * portaling, classes — comes from `useSelect`, like every other select.
 */
export const WindowedSelect: FC<WindowedSelectProps> = ({
  windowThreshold = DEFAULT_WINDOW_THRESHOLD,
  variant,
  ...props
}) => {
  // `variant` only styles a windowed select. The table-filter behaviour
  // useSelect attaches to it (autofocus, an inline menu that stays open, the
  // search-icon control) is for the generated filters; the one windowed
  // select that passes `tableFilter`, the saved-filter list in the filters
  // menu, only wants the look.
  const selectProps = useSelect(props);
  const classNames = useMemo(
    () =>
      getSelectTailwindClassNames({
        size: props.size,
        variant,
        hasError: Boolean(props.meta?.touched && props.meta?.error),
      }),
    [props.size, variant, props.meta?.touched, props.meta?.error],
  );

  const shouldVirtualize = useMemo(
    () => countOptions(props.options) >= windowThreshold,
    [props.options, windowThreshold],
  );

  return (
    <BaseSelect
      {...selectProps}
      classNames={classNames}
      components={
        shouldVirtualize
          ? { ...selectProps.components, MenuList: VirtualMenuList }
          : selectProps.components
      }
    />
  );
};

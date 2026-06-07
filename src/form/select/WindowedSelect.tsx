import classNames from 'classnames';
import { FC, useMemo } from 'react';
import BaseSelect from 'react-select';

import { composeComponents } from './SelectHelper';
import { useSelectTheme } from './theme';
import { CustomSelectProps } from './types';
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

export const WindowedSelect: FC<WindowedSelectProps> = ({
  components = undefined,
  windowThreshold = DEFAULT_WINDOW_THRESHOLD,
  ...props
}) => {
  const theme = useSelectTheme();
  const composedComponents = composeComponents(
    components,
    (props as any).isMulti,
  );

  const shouldVirtualize = useMemo(
    () => countOptions((props as any).options) >= windowThreshold,
    [(props as any).options, windowThreshold],
  );

  const finalComponents = shouldVirtualize
    ? { ...composedComponents, MenuList: VirtualMenuList }
    : composedComponents;

  return (
    <BaseSelect
      theme={theme}
      menuPortalTarget={document.body}
      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
      menuPosition="fixed"
      menuPlacement="bottom"
      {...(props as any)}
      components={finalComponents}
      className={classNames('metronic-select-container', props.className)}
      classNamePrefix="metronic-select"
    />
  );
};

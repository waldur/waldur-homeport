import classNames from 'classnames';
import { FC } from 'react';
import BaseWindowedSelect from 'react-windowed-select';

import { composeComponents } from './SelectHelper';
import { useSelectTheme } from './theme';
import { CustomSelectProps } from './types';

export const WindowedSelect: FC<CustomSelectProps> = ({
  components = undefined,
  ...props
}) => {
  const theme = useSelectTheme();
  const composedComponents = composeComponents(components, props.isMulti);
  return (
    <BaseWindowedSelect
      theme={theme}
      {...{
        menuPortalTarget: document.body,
        styles: { menuPortal: (base) => ({ ...base, zIndex: 9999 }) },
        menuPosition: 'fixed',
        menuPlacement: 'bottom',
      }}
      components={composedComponents}
      {...(props as any)}
      className={classNames('metronic-select-container', props.className)}
      classNamePrefix="metronic-select"
    />
  );
};

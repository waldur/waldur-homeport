import { WarningCircleIcon } from '@phosphor-icons/react';
import { uniqueId } from 'lodash-es';
import { FC } from 'react';

import { Tip, TipProps } from './Tooltip';
import { AtLeast } from './types';

interface WarnTipProps extends AtLeast<TipProps, 'label'> {
  hasSpace?: boolean;
}

export const WarnTip: FC<WarnTipProps> = ({
  id = uniqueId(),
  hasSpace,
  ...rest
}) => (
  <>
    {hasSpace && <>&nbsp;</>}
    <Tip id={`tip-warn-${id}`} {...rest}>
      <span className="svg-icon svg-icon-3 svg-icon-warning icon-align">
        <WarningCircleIcon weight="bold" />
      </span>
    </Tip>
  </>
);

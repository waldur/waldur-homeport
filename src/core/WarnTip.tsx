import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { Tooltip, TooltipProps } from 'waldur-ui';

interface WarnTooltipProps extends Omit<TooltipProps, 'children'> {
  hasSpace?: boolean;
}

export const WarnTip: FC<WarnTooltipProps> = ({ hasSpace, ...rest }) => (
  <>
    {hasSpace && <>&nbsp;</>}
    <Tooltip {...rest}>
      <WarningCircleIcon
        weight="bold"
        className="svg-icon svg-icon-3 svg-icon-warning icon-align"
      />
    </Tooltip>
  </>
);

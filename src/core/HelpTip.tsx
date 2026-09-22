import { QuestionIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { Tooltip, TooltipProps } from 'waldur-ui';

interface HelpTipProps extends Omit<TooltipProps, 'children'> {
  hasSpace?: boolean;
}

/**
 * A question mark next to a heading or a label, explaining what it means.
 * The bubble is wider and left-aligned than the default, because a help text
 * is a sentence rather than the word a plain tooltip usually carries.
 */
export const HelpTip: FC<HelpTipProps> = ({
  hasSpace,
  contentClassName,
  ...rest
}) => (
  <>
    {hasSpace && <>&nbsp;</>}
    <Tooltip
      contentClassName={`max-w-[320px] text-left ${contentClassName ?? ''}`}
      {...rest}
    >
      {/* The trigger is the span rather than the icon itself, so the hover
          target is the whole mark and the test id survives icon changes. */}
      <span className="d-inline-flex text-muted" data-testid="help-tip">
        <QuestionIcon
          weight="bold"
          className="svg-icon svg-icon-4 icon-align"
        />
      </span>
    </Tooltip>
  </>
);

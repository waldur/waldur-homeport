import { QuestionIcon } from '@phosphor-icons/react';
import { ReactNode } from 'react';

import { Tooltip } from '../Tooltip';

/**
 * The "?" after a check control's label or a radio group's legend. A button,
 * so keyboard focus reaches it and it shows the help on focus as well as on
 * hover. Place it beside the `<label>`, never inside it: a click on it would
 * toggle the control, and a button inside a label is a second control the
 * label names. Centre it on the text with a flex row, as CheckLabel and
 * RadioGroup do.
 *
 * Internal to the check controls.
 */
export const CheckHelp = ({ tooltip }: { tooltip: ReactNode }) => (
  <Tooltip label={tooltip}>
    <button
      type="button"
      aria-label="Help"
      className="m-0 inline-flex border-0 bg-transparent p-0"
    >
      <QuestionIcon
        weight="bold"
        size={16}
        className="text-[var(--check-description)]"
      />
    </button>
  </Tooltip>
);

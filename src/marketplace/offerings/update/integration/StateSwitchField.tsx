import { FC } from 'react';
import { FieldRenderProps } from 'react-final-form';

import { CheckOrX } from '@/core/CheckOrX';
import { SwitchField } from '@/form/SwitchField';
import { withEditField } from '@/form/withEditField';

// The dialog's title names the setting; the switch says which way it is set,
// in the words the row uses.
const StateSwitchField: FC<
  FieldRenderProps<any> & { 'aria-label'?: string }
> = (props) => (
  <SwitchField
    input={props.input}
    meta={props.meta}
    label={<CheckOrX value={Boolean(props.input.value)} />}
    aria-label={props['aria-label']}
  />
);

/** A switch row whose edit dialog shows the state next to the switch. */
export const StateSwitchEditField = withEditField(StateSwitchField, {
  displayValue: (value) => <CheckOrX value={value} />,
  passLabelToControl: true,
});

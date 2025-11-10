import { FormLabel, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

interface GroupByButton {
  value: string;
  label: string;
}

interface MetadataGroupByProps {
  value;
  onChange;
  buttons: GroupByButton[];
}

export const MetadataGroupBy = ({
  value,
  onChange,
  buttons,
}: MetadataGroupByProps) => {
  return (
    <>
      <FormLabel className="mb-0">{translate('Group by:')}</FormLabel>
      <ToggleButtonGroup
        type="radio"
        name="groupBy"
        value={value}
        onChange={onChange}
      >
        {buttons.map((button) => (
          <ToggleButton
            key={button.value}
            id={'tbg-' + button.value}
            value={button.value}
            variant="tertiary"
            size="sm"
          >
            {button.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </>
  );
};

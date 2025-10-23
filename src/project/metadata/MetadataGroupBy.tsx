import { FormLabel, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

export const MetadataGroupBy = ({ value, onChange }) => {
  return (
    <>
      <FormLabel className="mb-0">{translate('Group by:')}</FormLabel>
      <ToggleButtonGroup
        type="radio"
        name="groupBy"
        value={value}
        onChange={onChange}
      >
        <ToggleButton
          id="tbg-answer"
          value="answer"
          variant="tertiary"
          size="sm"
        >
          {translate('Answer')}
        </ToggleButton>
        <ToggleButton
          id="tbg-project"
          value="project"
          variant="tertiary"
          size="sm"
        >
          {translate('Project')}
        </ToggleButton>
      </ToggleButtonGroup>
    </>
  );
};

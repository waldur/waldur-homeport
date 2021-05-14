import { FunctionComponent } from 'react';

import { required } from '@waldur/core/validators';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { reactSelectMenuPortaling } from '@waldur/form/utils';
import { translate } from '@waldur/i18n';
import { moveToProjectAutocomplete } from '@waldur/marketplace/common/autocompletes';

interface MoveToProjectAutocompleteProps {
  isDisabled: boolean;
}

export const MoveToProjectAutocomplete: FunctionComponent<MoveToProjectAutocompleteProps> = ({
  isDisabled,
}) => (
  <div className="form-group">
    <label className="control-label">
      {translate('Move to project')}
      <span className="text-danger"> *</span>
    </label>
    <AsyncSelectField
      name="project"
      validate={required}
      placeholder={translate('Select project...')}
      loadOptions={(query, prevOptions, { page }) =>
        moveToProjectAutocomplete(query, prevOptions, page)
      }
      getOptionValue={(option) => option.url}
      getOptionLabel={(option) => `${option.customer_name} / ${option.name}`}
      noOptionsMessage={() => translate('No projects')}
      isDisabled={isDisabled}
      {...reactSelectMenuPortaling()}
    />
  </div>
);

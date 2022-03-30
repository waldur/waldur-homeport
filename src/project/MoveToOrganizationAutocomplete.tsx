import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';

import { required } from '@waldur/core/validators';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { reactSelectMenuPortaling } from '@waldur/form/utils';
import { translate } from '@waldur/i18n';
import { organizationAutocomplete } from '@waldur/marketplace/common/autocompletes';

interface MoveToOrganizationAutocompleteProps {
  isDisabled: boolean;
}

export const MoveToOrganizationAutocomplete: FunctionComponent<MoveToOrganizationAutocompleteProps> =
  ({ isDisabled }) => (
    <Form.Group>
      <Form.Label>
        {translate('Move to organization')}
        <span className="text-danger"> *</span>
      </Form.Label>
      <AsyncSelectField
        name="organization"
        validate={required}
        placeholder={translate('Select organization...')}
        loadOptions={(query, prevOptions, additional) =>
          organizationAutocomplete(query, prevOptions, additional, null, [
            'name',
            'url',
          ])
        }
        getOptionValue={(option) => option.url}
        noOptionsMessage={() => translate('No organizations')}
        isDisabled={isDisabled}
        {...reactSelectMenuPortaling()}
      />
    </Form.Group>
  );

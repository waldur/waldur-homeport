import { Field } from 'react-final-form';

import {
  composeValidators,
  positive,
  required,
  validateMaxLength,
} from '@/core/validators';
import { AsyncSelectGroup, FormGroup, NumberGroup, StringGroup } from '@/form';
import { translate } from '@/i18n';
import {
  organizationAutocomplete,
  providerOfferingsAutocomplete,
} from '@/marketplace/common/autocompletes';

import { PROJECT_TEMPLATE_FIELD_CONSTRAINTS } from '../constants';

import { AllocationUnitsMappingField } from './AllocationUnitsMappingField';
import { RoleMappingField } from './RoleMappingField';

const loadOrganizations = organizationAutocomplete({
  field: ['name', 'uuid', 'abbreviation'],
  o: 'name',
});

const loadOfferings = providerOfferingsAutocomplete();

export const ProjectTemplateFormFields = () => (
  <>
    <StringGroup
      name="name"
      placeholder={translate('e.g., my-project-template')}
      maxLength={PROJECT_TEMPLATE_FIELD_CONSTRAINTS.MAX_PROJECTCLASS_LENGTH}
      validate={composeValidators(
        required,
        validateMaxLength(
          PROJECT_TEMPLATE_FIELD_CONSTRAINTS.MAX_PROJECTCLASS_LENGTH,
        ),
      )}
      required
      label={translate('Name of project template')}
    />

    <StringGroup
      name="offering"
      placeholder={translate('e.g. my-remote-offering')}
      maxLength={PROJECT_TEMPLATE_FIELD_CONSTRAINTS.MAX_OFFERING_LENGTH}
      validate={composeValidators(
        required,
        validateMaxLength(
          PROJECT_TEMPLATE_FIELD_CONSTRAINTS.MAX_OFFERING_LENGTH,
        ),
      )}
      required
      label={translate('Name of the remote offering, e.g. "isambard-ai"')}
    />

    <StringGroup
      name="portal"
      placeholder={translate('Portal identifier')}
      maxLength={PROJECT_TEMPLATE_FIELD_CONSTRAINTS.MAX_PORTALIDENTIFIER_LENGTH}
      validate={composeValidators(
        required,
        validateMaxLength(
          PROJECT_TEMPLATE_FIELD_CONSTRAINTS.MAX_PORTALIDENTIFIER_LENGTH,
        ),
      )}
      required
      label={translate('Portal from which requests are allowed')}
    />

    <AsyncSelectGroup
      name="customer"
      label={translate('Organisation into which to deploy projects')}
      required
      placeholder={translate('Select organisation')}
      validate={required}
      loadOptions={loadOrganizations}
      debounceTimeout={1000}
      defaultOptions
      getOptionValue={(option) => option.uuid}
      getOptionLabel={(option) => option.name}
      noOptionsMessage={() => translate('No organisations found')}
      isClearable={true}
    />

    <StringGroup
      name="key"
      placeholder={translate('e.g., a1b2c3d4e5f6g7h8i9j0')}
      maxLength={PROJECT_TEMPLATE_FIELD_CONSTRAINTS.MAX_KEY_LENGTH}
      validate={validateMaxLength(
        PROJECT_TEMPLATE_FIELD_CONSTRAINTS.MAX_KEY_LENGTH,
      )}
      label={translate('Key used to verify requests from the remote portal')}
    />

    <StringGroup
      name="shortname"
      placeholder={translate('e.g., a{year}{count}')}
      maxLength={
        PROJECT_TEMPLATE_FIELD_CONSTRAINTS.MAX_PROJECT_SHORTNAME_LENGTH
      }
      validate={composeValidators(
        required,
        validateMaxLength(
          PROJECT_TEMPLATE_FIELD_CONSTRAINTS.MAX_PROJECT_SHORTNAME_LENGTH,
        ),
      )}
      help={translate(
        'Use {year} for last digit of year and {count} for sequential letter (a, b, c, etc.)',
      )}
      required
      label={translate('Pattern used to generate project shortnames')}
    />

    <AsyncSelectGroup
      name="offerings"
      label={translate('Default offerings for new projects')}
      placeholder={translate('Select offering...')}
      loadOptions={loadOfferings}
      debounceTimeout={1000}
      defaultOptions
      getOptionValue={(option) => option.uuid}
      getOptionLabel={(option) => option.name}
      noOptionsMessage={() => translate('No public offerings')}
      isClearable={true}
      isMulti={true}
    />

    <FormGroup controlId="role_mapping" label={translate('Role Mapping')}>
      <Field
        name="role_mapping"
        component={RoleMappingField}
        placeholder={translate('Map remote portal roles to local roles')}
        help={translate(
          'Map remote portal roles to local roles. For example, map "admin" to "Project Manager" and "user" to "Project Member".',
        )}
      />
    </FormGroup>

    <FormGroup
      controlId="allocation_units_mapping"
      label={translate('Allocation credit mapping')}
    >
      <Field
        name="allocation_units_mapping"
        component={AllocationUnitsMappingField}
        placeholder={translate('Map allocation units to credits')}
        help={translate(
          'Map allocation units to credits. For example, 1 credit is 4 GPU hours.',
        )}
      />
    </FormGroup>

    <NumberGroup
      name="approval_limit"
      placeholder={translate('e.g., 1000.00')}
      step="0.01"
      min="0"
      validate={positive}
      help={translate(
        'Credit limit beyond which requests need local admin approval. Leave empty for no approval required, set to 0 for all requests to require approval.',
      )}
      label={translate('Credit limit beyond which approval is required')}
    />

    <NumberGroup
      name="max_credit_limit"
      placeholder={translate('e.g., 10000.00')}
      step="0.01"
      min="0"
      validate={positive}
      help={translate(
        'Maximum credit limit for projects using this template. Requests beyond this are automatically rejected. Leave empty for no maximum limit, set to 0 to prevent project creation.',
      )}
      label={translate(
        'Maximum credit request limit for projects using this template',
      )}
    />
  </>
);

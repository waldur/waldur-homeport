import { FC } from 'react';
import { Field } from 'react-final-form';

import { required } from '@/core/validators';
import { SelectField } from '@/form';
import { AsyncSelectFieldFinal } from '@/form/AsyncSelectField';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { CommaSeparatedListField } from '@/form/CommaSeparatedListField';
import { StringField } from '@/form/StringField';
import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { Role } from '@/permissions/types';
import { getProjectRoles } from '@/permissions/utils';

import { validateEmailPatterns } from './utils';

export const RuleForm: FC<{ values; change }> = ({ values, change }) => {
  return (
    <>
      <FormGroup label={translate('Rule name')} required>
        <Field
          component={StringField as any}
          name="name"
          placeholder={translate('e.g. Default users')}
          validate={required}
        />
      </FormGroup>

      <FormGroup label={translate('Affiliations')}>
        <Field
          component={CommaSeparatedListField as any}
          name="user_affiliations"
          placeholder="student, faculty, researcher (comma-separated)"
          description={translate(
            'Enter comma-separated affiliation identifiers',
          )}
        />
      </FormGroup>

      <FormGroup label={translate('Email patterns')}>
        <Field
          component={CommaSeparatedListField as any}
          name="user_email_patterns"
          placeholder={translate('e.g. .*@example.com')}
          description={translate(
            'Enter space separated regex pattern to match user email',
          )}
          separator="space"
          validate={validateEmailPatterns}
        />
      </FormGroup>

      <FormGroup>
        <Field
          name="use_user_organization_as_customer_name"
          component={AwesomeCheckboxField as any}
          label={translate('Use user organization as customer name')}
          tooltip={translate(
            'If enabled, the customer name will be taken from the user’s organization provided by IdP.',
          )}
          tooltipEnd
          alignMiddle
          className="w-100"
          onChange={() => change('customer', null)}
        />
      </FormGroup>

      <FormGroup
        label={translate('Organization')}
        required={!values.use_user_organization_as_customer_name}
      >
        <AsyncSelectFieldFinal
          name="customer"
          loadOptions={(query, prevOptions, page) =>
            organizationAutocomplete(query, prevOptions, page, {
              field: ['name', 'url'],
              o: 'name',
            })
          }
          getOptionValue={({ url }) => url}
          // validate={/* Handled by Parent <Form> */}
          isDisabled={values.use_user_organization_as_customer_name}
          isClearable
        />
      </FormGroup>

      <FormGroup label={translate('Project role')} required>
        <Field
          component={SelectField as any}
          name="project_role"
          options={getProjectRoles()}
          getOptionLabel={(role: Role) => role.description || role.name}
          getOptionValue={({ name }) => name}
          validate={required}
          simpleValue
        />
      </FormGroup>
    </>
  );
};

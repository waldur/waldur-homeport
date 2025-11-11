import { FC } from 'react';
import { Field } from 'react-final-form';

import { required } from '@waldur/core/validators';
import { SelectField } from '@waldur/form';
import { AsyncSelectFieldFinal } from '@waldur/form/AsyncSelectField';
import { CommaSeparatedListField } from '@waldur/form/CommaSeparatedListField';
import { StringField } from '@waldur/form/StringField';
import { translate } from '@waldur/i18n';
import { organizationAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { Role } from '@waldur/permissions/types';
import { getProjectRoles } from '@waldur/permissions/utils';

import { validateEmailPatterns } from './utils';

export const RuleForm: FC = () => {
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

      <FormGroup label={translate('Organization')} required>
        <AsyncSelectFieldFinal
          name="customer"
          loadOptions={(query, prevOptions, page) =>
            organizationAutocomplete(query, prevOptions, page, {
              field: ['name', 'url'],
              o: 'name',
            })
          }
          getOptionValue={({ url }) => url}
          validate={required}
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

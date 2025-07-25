import { FC } from 'react';

import { required } from '@waldur/core/validators';
import { FormContainer, SelectField } from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { CommaSeparatedListField } from '@waldur/form/CommaSeparatedListField';
import { StringField } from '@waldur/form/StringField';
import { translate } from '@waldur/i18n';
import { organizationAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { Role } from '@waldur/permissions/types';
import { getProjectRoles } from '@waldur/permissions/utils';

const validateEmailPatterns = (value) => {
  if (!value) return undefined;
  const patterns = Array.isArray(value)
    ? value.filter(Boolean)
    : value.split(' ').filter(Boolean);

  const emailLikeRegex = /@.+\..+/;

  for (const pattern of patterns) {
    if (!emailLikeRegex.test(pattern)) {
      return translate('Please use valid email patterns.');
    }
    try {
      new RegExp(pattern);
    } catch {
      return translate('Pattern is not a valid regex.');
    }
  }
  return undefined;
};

export const RuleForm: FC<{ submitting? }> = (props) => {
  return (
    <FormContainer submitting={props.submitting}>
      <StringField
        name="name"
        label={translate('Rule name')}
        placeholder={translate('e.g. Default users')}
        validate={required}
        required
      />
      <CommaSeparatedListField
        name="user_affiliations"
        label={translate('Affiliations')}
        placeholder="student, faculty, researcher (comma-separated)"
        description={translate('Enter comma-separated affiliation identifiers')}
      />
      <CommaSeparatedListField
        name="user_email_patterns"
        label={translate('Email patterns')}
        placeholder={translate('e.g.') + ' .*@example.com'}
        description={translate(
          'Enter space separated regex pattern to match user email',
        )}
        separator="space"
        validate={validateEmailPatterns}
      />

      <AsyncSelectField
        name="customer"
        label={translate('Organization')}
        loadOptions={(query, prevOptions, page) =>
          organizationAutocomplete(query, prevOptions, page, {
            field: ['name', 'url'],
            o: 'name',
          })
        }
        getOptionValue={({ url }) => url}
        required
        validate={required}
      />
      <SelectField
        label={translate('Project role')}
        name="project_role"
        options={getProjectRoles()}
        getOptionLabel={(role: Role) => role.description || role.name}
        getOptionValue={({ name }) => name}
        required
        validate={required}
        simpleValue
      />
    </FormContainer>
  );
};

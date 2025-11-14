import { FunctionComponent } from 'react';
import { Field as FinalField } from 'react-final-form';
import { OptionProps, components } from 'react-select';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { SelectField } from '@waldur/form/SelectField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { Role, RoleType } from '@waldur/permissions/types';
import { getRoles } from '@waldur/permissions/utils';

const renderRoleType = (roleType: RoleType) =>
  ({
    customer: 'O',
    project: 'P',
    service_provider: 'SP',
    call_organizer: 'CO',
  })[roleType] || '';

const RoleOption: FunctionComponent<OptionProps<Role>> = (props) => (
  <components.Option {...props}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      {props.data.description || props.data.name}
      <span
        style={{
          alignSelf: 'center',
          marginLeft: 'auto',
        }}
      >
        {renderRoleType(props.data.content_type)}
      </span>
    </div>
  </components.Option>
);

export const RoleGroup: FunctionComponent<{
  types: RoleType[];
  legacyField?: boolean;
}> = ({ types, legacyField }) => {
  const Component = (legacyField ? Field : FinalField) as any;

  return (
    <FormGroup label={translate('Role')}>
      <Component
        name="role"
        component={SelectField as any}
        options={getRoles(types)}
        getOptionLabel={(role: Role) => role.description || role.name}
        getOptionValue={({ name }) => name}
        validate={required}
        components={{ Option: RoleOption }}
      />
    </FormGroup>
  );
};

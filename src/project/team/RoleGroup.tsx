import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import { OptionProps, components } from 'react-select';

import { required } from '@/core/validators';
import { SelectField } from '@/form/SelectField';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { Role, RoleType } from '@/permissions/types';
import { getRoles } from '@/permissions/utils';

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
}> = ({ types }) => {
  return (
    <FormGroup label={translate('Role')} controlId="role">
      <Field
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

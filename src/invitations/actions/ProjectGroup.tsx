import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { formValueSelector, Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { isFeatureVisible } from '@waldur/features/connect';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

import { GROUP_INVITATION_CREATE_FORM_ID } from './constants';

export const ProjectGroup: FunctionComponent<{ customer; disabled }> = ({
  customer,
  disabled,
}) => {
  const role = useSelector((state: RootState) =>
    formValueSelector(GROUP_INVITATION_CREATE_FORM_ID)(state, 'role'),
  );
  const roleDisabled = isFeatureVisible('invitation.require_user_details');
  const projectEnabled = role.content_type === 'project' && !roleDisabled;
  if (!projectEnabled) {
    return null;
  }

  return (
    <Form.Group>
      <Form.Label>
        {translate('Project')}
        <span className="text-danger">*</span>
      </Form.Label>
      <Field
        name="project"
        validate={[required]}
        component={(fieldProps) => (
          <Select
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            options={customer.projects}
            isDisabled={disabled}
            placeholder={translate('Select project')}
            getOptionValue={(option) => option.uuid}
            getOptionLabel={(option) => option.name}
            isClearable={true}
          />
        )}
      />
    </Form.Group>
  );
};

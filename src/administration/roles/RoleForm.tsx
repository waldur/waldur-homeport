import { reduxForm } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { required } from '@waldur/core/validators';
import { FormContainer, SubmitButton } from '@waldur/form';
import { StringField } from '@waldur/form/StringField';
import { translate } from '@waldur/i18n';

import { PermissionField } from './PermissionField';

export const RoleForm = reduxForm<any, { onSubmit; onCancel; role? }>({
  form: 'RoleForm',
})((props) => {
  return (
    <form onSubmit={props.handleSubmit(props.onSubmit)}>
      <FormContainer submitting={props.submitting}>
        <StringField
          name="name"
          label={translate('Name')}
          validate={required}
          required
          disabled={props.role?.is_system_role}
        />
        {ENV.languageChoices.map(({ code, label }) => (
          <StringField
            key={code}
            name={`description_${code}`}
            label={translate('Description ({language})', { language: label })}
          />
        ))}
        <PermissionField
          name="permissions"
          label={translate('Permissions')}
          validate={required}
          required
        />
        <SubmitButton
          disabled={props.invalid}
          submitting={props.submitting}
          label={translate('Save')}
        />
        <button
          type="button"
          className="btn btn-secondary ms-2"
          onClick={props.onCancel}
        >
          {translate('Cancel')}
        </button>
      </FormContainer>
    </form>
  );
});

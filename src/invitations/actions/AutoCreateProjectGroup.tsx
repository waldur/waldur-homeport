import { useSelector } from 'react-redux';
import { formValueSelector, Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { FormGroup, StringField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { type RootState } from '@waldur/store/reducers';

import { GROUP_INVITATION_CREATE_FORM_ID } from './constants';

const NameTemplateTooltip = () => (
  <div className="text-start py-1">
    <p className="fw-bold mb-2">{translate('Available variables')}</p>
    <ul className="mb-0 list-unstyled">
      <li>{'{user.full_name} - ' + translate('Full name of the user')}</li>
      <li>{'{user.email} - ' + translate('Email address of the user')}</li>
      <li>{'{user.username} - ' + translate('Username of the user')}</li>
      <li>{'{invitation.title} - ' + translate('Title of this invitation')}</li>
      <li>
        {'{organization.name} - ' + translate('Name of the organization')}
      </li>
    </ul>
  </div>
);

export const AutoCreateProjectGroup = ({ disabled }) => {
  const formValues = useSelector((state: RootState) =>
    formValueSelector(GROUP_INVITATION_CREATE_FORM_ID)(
      state,
      'type',
      'role',
      'auto_create_project',
    ),
  );
  const projectEnabled = formValues.role?.content_type === 'project';
  if (!projectEnabled) {
    return null;
  }

  return (
    <>
      <Field
        name="auto_create_project"
        component={FormGroup}
        hideLabel
        space={5}
        disabled={formValues.type === 'public' || disabled}
      >
        <AwesomeCheckboxField
          label={translate('Auto-create project')}
          alignMiddle
        />
      </Field>
      {formValues.auto_create_project && (
        <Field
          name="project_name_template"
          component={FormGroup}
          label={translate('Project name template')}
          required
          validate={[required]}
          placeholder={
            translate('e.g.') +
            ' {user.full_name} ' +
            translate('Research project')
          }
          description={translate(
            'Use variables like {user.full_name}, {user.email} to create dynamic project names',
          )}
          disabled={disabled}
          tooltipEnd
          tooltipProps={{ autoWidth: true }}
          tooltip={<NameTemplateTooltip />}
          space={5}
        >
          <StringField />
        </Field>
      )}
    </>
  );
};

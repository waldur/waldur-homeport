import { useFormState } from 'react-final-form';

import { required } from '@/core/validators';
import { BooleanGroup, StringGroup } from '@/form';
import { translate } from '@/i18n';

const NameTemplateTooltip = () => (
  <div className="text-start py-1">
    <p className="fw-bold mb-2">{translate('Available variables')}</p>
    <ul className="mb-0 list-unstyled">
      <li>
        {'{full_name} - '} {translate('Full name of the user')}
      </li>
      <li>
        {'{email} - '} {translate('Email address of the user')}
      </li>
      <li>
        {'{username} - '} {translate('Username of the user')}
      </li>
    </ul>
  </div>
);

export const AutoCreateProjectGroup = ({ disabled }) => {
  const { values } = useFormState();
  const projectEnabled = values?.role?.content_type === 'project';

  if (!projectEnabled) {
    return null;
  }

  return (
    <>
      <BooleanGroup
        name="auto_create_project"
        label={translate('Auto-create project')}
        alignMiddle
        disabled={values?.type === 'public' || disabled}
      />
      {values?.auto_create_project && (
        <>
          <StringGroup
            name="project_name_template"
            placeholder={translate('e.g. {full_name} Research project')}
            disabled={disabled}
            validate={required}
            label={translate('Project name template')}
            required
            description={translate(
              'Use variables like {full_name}, {email} to create dynamic project names',
            )}
            help={<NameTemplateTooltip />}
          />
          <BooleanGroup
            name="allow_custom_project_details"
            label={translate(
              'Allow users to provide custom project name and description',
            )}
            alignMiddle
            disabled={disabled}
          />
          <BooleanGroup
            name="allow_multiple_requests"
            label={translate(
              'Allow users to create multiple projects from this invitation',
            )}
            alignMiddle
            disabled={disabled}
          />
        </>
      )}
    </>
  );
};

import { formatRelative } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

export const EndDateField = ({ resource }) => {
  return resource.end_date ? (
    <Field
      label={translate('Termination date')}
      value={
        <>
          {resource.end_date} ({formatRelative(resource.end_date)})
        </>
      }
    />
  ) : null;
};

export const ProjectEndDateField = ({ resource }) => {
  return resource.project_end_date ? (
    <Field
      label={translate('Project end date')}
      value={
        <>
          {resource.project_end_date} (
          {formatRelative(resource.project_end_date)})
        </>
      }
    />
  ) : null;
};

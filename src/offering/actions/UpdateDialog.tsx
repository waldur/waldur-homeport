import { translate } from '@waldur/i18n';
import { updateOffering } from '@waldur/offering/api';
import { createNameField } from '@waldur/resource/actions/base';
import { UpdateResourceDialog } from '@waldur/resource/actions/UpdateResourceDialog';

export const UpdateDialog = ({ resolve: { resource } }) => {
  return (
    <UpdateResourceDialog
      fields={[
        createNameField(),
        {
          name: 'report',
          label: translate('Report'),
          help_text: translate(
            'Example: [{"header": "Database instance info", "body": "data"}]',
          ),
          required: false,
          type: 'json',
        },
      ]}
      resource={resource}
      initialValues={{
        name: resource.name,
        report: resource.report ? JSON.stringify(resource.report) : '',
      }}
      updateResource={(id, formData) =>
        updateOffering(id, {
          name: formData.name,
          report: formData.report ? JSON.parse(formData.report) : undefined,
        })
      }
      verboseName={translate('offering')}
    />
  );
};

import { FC } from 'react';
import { marketplaceProviderResourcesSubmitReport } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';

export const SubmitReportDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const mutation = useManagedMutation<any, any, { report?: string }>({
    mutationFn: (formData) =>
      marketplaceProviderResourcesSubmitReport({
        path: { uuid: resource.uuid },
        body: {
          report: formData.report ? JSON.parse(formData.report) : undefined,
        },
      }),

    successMessage: translate('Report has been submitted'),
    errorMessage: translate('Unable to submit report.'),
    refetch: refetch,
  });

  return (
    <ResourceActionDialog
      submitForm={mutation.mutateAsync}
      dialogTitle={translate('Submit report')}
      dialogSubtitle={
        <ScopeSubtitle
          label={translate('Resource name')}
          name={resource.name}
        />
      }
      formFields={[
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
      initialValues={{
        report: resource.report ? JSON.stringify(resource.report) : '',
      }}
    />
  );
};

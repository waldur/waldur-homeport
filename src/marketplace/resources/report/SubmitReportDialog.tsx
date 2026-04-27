import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { marketplaceProviderResourcesSubmitReport } from 'waldur-js-client';

import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';
import { showErrorResponse, showSuccess } from '@/store/notify';

export const SubmitReportDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();
  return (
    <ResourceActionDialog
      submitForm={async (formData) => {
        try {
          await marketplaceProviderResourcesSubmitReport({
            path: { uuid: resource.uuid },
            body: {
              report: formData.report ? JSON.parse(formData.report) : undefined,
            },
          });
          dispatch(showSuccess(translate('Report has been submitted')));
          if (refetch) {
            await refetch();
          }
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(showErrorResponse(e, translate('Unable to submit report.')));
        }
      }}
      dialogTitle={translate('Submit report')}
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

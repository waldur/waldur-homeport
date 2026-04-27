import { SubmissionError } from 'redux-form';
import { projectCreditsCreate } from 'waldur-js-client';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/hooks';
import { useNotify } from '@/store/hooks';

const ProjectCreditFormDialog = lazyComponent(() =>
  import('./ProjectCreditFormDialog').then((module) => ({
    default: module.ProjectCreditFormDialog,
  })),
);

export const ProjectCreateCreditButton = ({ refetch }) => {
  const { closeDialog, openDialog } = useModal();
  const { showErrorResponse, showSuccess } = useNotify();
  const openFormDialog = () =>
    openDialog(ProjectCreditFormDialog, {
      size: 'lg',
      formId: 'ProjectCreditCreateForm',
      submitFn: async (formData) => {
        try {
          await projectCreditsCreate({
            body: {
              ...formData,
              project: formData.project.url,
            },
          });
          closeDialog();
          refetch();
          showSuccess(translate('Credit has been created.'));
        } catch (e) {
          showErrorResponse(e, translate('Unable to create a credit'));
          if (e && e.response.status === 400) {
            throw new SubmissionError(e);
          }
        }
      },
    });
  return <AddButton action={openFormDialog} />;
};

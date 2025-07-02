import { PencilSimpleIcon } from '@phosphor-icons/react';
import { Dropdown } from 'react-bootstrap';
import { SubmissionError } from 'redux-form';
import { projectCreditsUpdate } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';
import { useNotify } from '@waldur/store/hooks';

import { getCreditInitialValues } from './utils';

const ProjectCreditFormDialog = lazyComponent(() =>
  import('./ProjectCreditFormDialog').then((module) => ({
    default: module.ProjectCreditFormDialog,
  })),
);

export const ProjectEditCreditButton = ({ row, refetch }) => {
  const { closeDialog, openDialog } = useModal();
  const { showErrorResponse, showSuccess } = useNotify();

  const openCreditFormDialog = () =>
    openDialog(ProjectCreditFormDialog, {
      size: 'lg',
      formId: 'ProjectCreditEditForm',
      initialValues: {
        project: {
          uuid: row.project_uuid,
          name: row.project_name,
          url: row.project,
        },
        ...getCreditInitialValues(row),
      },
      submitFn: async (formData) => {
        try {
          await projectCreditsUpdate({
            path: { uuid: row.uuid },
            body: {
              ...formData,
              project: formData.project.url,
            },
          });
          closeDialog();
          refetch();
          showSuccess(translate('Credit has been updated.'));
        } catch (e) {
          showErrorResponse(e, translate('Unable to edit the credit'));
          if (e.response && e.response.status === 400) {
            throw new SubmissionError(e.response.data);
          }
        }
      },
    });

  return (
    <Dropdown.Item as="button" onClick={openCreditFormDialog}>
      <span className="svg-icon svg-icon-2">
        <PencilSimpleIcon weight="bold" />
      </span>
      {translate('Edit')}
    </Dropdown.Item>
  );
};

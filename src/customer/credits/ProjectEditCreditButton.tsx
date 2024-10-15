import { PencilSimple } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { SubmissionError } from 'redux-form';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';
import { showErrorResponse } from '@waldur/store/notify';

import { updateProjectCredit } from './api';
import { ProjectCreditFormData } from './types';

const ProjectCreditFormDialog = lazyComponent(
  () => import('./ProjectCreditFormDialog'),
  'ProjectCreditFormDialog',
);

export const ProjectEditCreditButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openCreditFormDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(ProjectCreditFormDialog, {
          size: 'lg',
          formId: 'ProjectCreditEditForm',
          initialValues: {
            value: row.value,
            project: {
              uuid: row.project_uuid,
              name: row.project_name,
              url: row.project,
            },
            use_organisation_credit: row.use_organisation_credit,
          },
          onSubmit: (formData) => {
            const payload: ProjectCreditFormData = {
              project: formData.project.url,
              value: formData.value,
              use_organisation_credit: formData.use_organisation_credit,
            };
            return updateProjectCredit(row.uuid, payload)
              .then(() => {
                dispatch(closeModalDialog());
                refetch();
              })
              .catch((e) => {
                dispatch(
                  showErrorResponse(e, translate('Unable to edit the credit')),
                );
                if (e.response && e.response.status === 400) {
                  throw new SubmissionError(e.response.data);
                }
              });
          },
        }),
      ),
    [dispatch, row, refetch],
  );

  return (
    <Dropdown.Item as="button" onClick={openCreditFormDialog}>
      <span className="svg-icon svg-icon-2">
        <PencilSimple weight="bold" />
      </span>
      {translate('Edit')}
    </Dropdown.Item>
  );
};

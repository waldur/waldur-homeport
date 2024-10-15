import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { SubmissionError } from 'redux-form';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';
import { showErrorResponse } from '@waldur/store/notify';

import { createProjectCredit } from './api';
import { ProjectCreditFormData } from './types';

const ProjectCreditFormDialog = lazyComponent(
  () => import('./ProjectCreditFormDialog'),
  'ProjectCreditFormDialog',
);

export const ProjectCreateCreditButton = ({ refetch }) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(ProjectCreditFormDialog, {
          size: 'lg',
          formId: 'ProjectCreditCreateForm',
          onSubmit: (formData) => {
            const payload: ProjectCreditFormData = {
              project: formData.project.url,
              value: formData.value,
              use_organisation_credit: formData.use_organisation_credit,
            };
            return createProjectCredit(payload)
              .then(() => {
                dispatch(closeModalDialog());
                refetch();
              })
              .catch((e) => {
                dispatch(
                  showErrorResponse(e, translate('Unable to create a credit')),
                );
                if (e.response && e.response.status === 400) {
                  throw new SubmissionError(e.response.data);
                }
              });
          },
        }),
      ),
    [dispatch, refetch],
  );
  return <AddButton action={openFormDialog} />;
};

import { useCallback } from 'react';
import { Form } from 'react-final-form';
import { projectsPartialUpdate } from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';
import { useSetProject } from '@/workspace/hooks';

import { ScienceDomainGroup } from '../create/ScienceDomainGroup';

export const EditScienceDomainDialog = ({ resolve: { project } }) => {
  const setProject = useSetProject();
  const { showSuccess, showErrorResponse } = useNotify();

  const onSubmit = useCallback(
    async (formData) => {
      try {
        const payload = {
          science_sub_domain: formData.science_sub_domain?.uuid || null,
        };
        const response = await projectsPartialUpdate({
          path: { uuid: project.uuid },
          body: payload,
        });
        setProject(response.data);
        showSuccess(translate('Science domain has been updated.'));
      } catch (e) {
        showErrorResponse(e, translate('Unable to update science domain.'));
      }
    },
    [project, setProject, showSuccess, showErrorResponse],
  );

  return (
    <Form onSubmit={onSubmit}>
      {({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Edit science domain')}
            footer={
              <>
                <CloseDialogButton className="flex-equal" />
                <SubmitButton
                  submitting={submitting}
                  label={translate('Confirm')}
                  className="btn btn-primary flex-equal"
                />
              </>
            }
          >
            <ScienceDomainGroup />
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};

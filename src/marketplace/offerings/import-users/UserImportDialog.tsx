import { ArrowRightIcon } from '@phosphor-icons/react';
import { FC, useCallback, useState } from 'react';
import {
  marketplaceOfferingUsersCreate,
  OfferingUser,
  ServiceProvider,
} from 'waldur-js-client';

import { ProgressStep } from '@waldur/core/ProgressSteps';
import { WizardFormContainer } from '@waldur/form/WizardFormContainer';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import {
  showError,
  showErrorResponse,
  showSuccess,
} from '@waldur/store/notify';

import { Step1UploadFile } from './Step1UploadFile';
import { Step2PreviewAndImport } from './Step2PreviewAndImport';
import { OfferingUserRecord, RecordStatus } from './types';
import {
  BULK_IMPORT_OFFERING_USERS_FORM_ID,
  validateOfferingUserCreation,
} from './utils';

interface UserImportDialogProps {
  resolve: {
    provider?: ServiceProvider;
    refetch: () => void;
  };
}

const WizardForms = [Step1UploadFile, Step2PreviewAndImport];

const steps: ProgressStep[] = [
  {
    key: 'upload',
    label: translate('Bulk import'),
    completed: false,
  },
  {
    key: 'preview',
    label: translate('Preview & import'),
    completed: false,
  },
];

export const UserImportDialog: FC<UserImportDialogProps> = (props) => {
  // Save created users (to avoid recreation) when we make modifications on the file after a failed submission
  const [createdUsers, setCreatedUsers] = useState<OfferingUser[]>([]);
  // When the submission is failed, we keep the returned status of records here - including errors
  const [status, setStatus] = useState<RecordStatus[]>([]);

  const submitForm = useCallback(
    async (formData, dispatch, formProps) => {
      try {
        const validRecords: OfferingUserRecord[] = formData.payload.filter(
          (row) => {
            const validate = validateOfferingUserCreation(row);
            return validate.valid;
          },
        );

        // Import records
        const promises = [];
        const newStatus: RecordStatus[] = [];

        validRecords.forEach((user, idx) => {
          const userAlreadySaved = createdUsers.find(
            (exist) =>
              exist.user_username === user.user_username &&
              exist.offering_uuid === user.offering_uuid,
          );

          const payload = {
            offering_uuid: user.offering_uuid,
            user_uuid: user.user_uuid,
            username: user.username,
          };

          if (userAlreadySaved) {
            newStatus.push({ status: 'created', data: payload });
            return;
          } else {
            newStatus.push({ status: 'ready', data: payload });
          }

          promises.push(
            marketplaceOfferingUsersCreate({ body: payload })
              .then((res) => {
                setCreatedUsers((prev) =>
                  prev.concat({
                    user_username: res.data.user_username,
                    offering_uuid: payload.offering_uuid,
                  }),
                );
                newStatus[idx].status = 'created';
                return res;
              })
              .catch((err) => {
                newStatus[idx].status = 'erred';
                newStatus[idx].error = err;
                throw err; // pass errors to the next promise
              }),
          );
        });
        if (promises.length === 0 && createdUsers.length === 0) {
          dispatch(showError(translate('No valid offering user to import')));
          return;
        }

        await Promise.allSettled(promises).then((results) => {
          setStatus(newStatus);

          const error = results.filter((res) => res.status === 'rejected');
          const success = results.filter((res) => res.status === 'fulfilled');

          if (success.length) {
            props.resolve.refetch();
            dispatch(
              showSuccess(
                translate('Successfully imported {n} records', {
                  n: success.length,
                }),
              ),
            );
          }
          if (error.length) {
            dispatch(showErrorResponse(error[0].reason));
          }

          if (!error.length) {
            formProps.destroy();
            dispatch(closeModalDialog());
          }
          return results;
        });
      } catch (err) {
        dispatch(showErrorResponse(err));
      }
    },
    [createdUsers, setCreatedUsers, setStatus, props.resolve.refetch],
  );

  return (
    <WizardFormContainer
      form={BULK_IMPORT_OFFERING_USERS_FORM_ID}
      onSubmit={submitForm}
      steps={steps}
      hideStepper
      title={translate('Bulk import')}
      subtitle={translate(
        'Create offering users in bulk: download template {arrow} fill with your data {arrow} upload file',
        { arrow: <ArrowRightIcon weight="bold" /> },
        formatJsxTemplate,
      )}
      wizardForms={WizardForms}
      submitLabel={translate('Import')}
      initialValues={{
        payload: [], // This field will be filled in step 2, when the file is processed for sending to the server
      }}
      data={{ provider: props.resolve?.provider, status }}
      modalProps={{ bodyClassName: 'h-500px' }}
    />
  );
};

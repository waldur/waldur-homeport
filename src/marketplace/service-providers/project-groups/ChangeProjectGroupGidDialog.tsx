import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceServiceProviderProjectGroupsSetGid,
  ServiceProviderProjectGroup,
} from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { NumberGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { OutsideRangeField } from './OutsideRangeField';
import { useInlineErrorToast } from './useInlineErrorToast';
import {
  getValidationErrors,
  PROJECT_GROUP_QUERY_KEYS,
  toSubmissionErrors,
  validateGid,
} from './utils';

interface ChangeProjectGroupGidDialogProps {
  resolve: { group: ServiceProviderProjectGroup; refetch: () => void };
}

interface FormValues {
  gid?: number | string;
  allow_outside_range?: boolean;
}

/** Move a group to another GID, e.g. one a directory assigned meanwhile. */
export const ChangeProjectGroupGidDialog: FC<
  ChangeProjectGroupGidDialogProps
> = ({ resolve: { group, refetch } }) => {
  const toastUnshownError = useInlineErrorToast(
    translate('Unable to change the GID of the project group.'),
  );
  const mutation = useManagedMutation<any, any, FormValues>({
    mutationFn: (values) =>
      marketplaceServiceProviderProjectGroupsSetGid({
        path: { uuid: group.uuid },
        body: {
          gid: Number(values.gid),
          allow_outside_range: Boolean(values.allow_outside_range),
        },
      }),
    successMessage: translate('The GID of the project group has been changed.'),
    onError: toastUnshownError,
    invalidateQueries: PROJECT_GROUP_QUERY_KEYS,
    refetch,
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await mutation.mutateAsync(values);
    } catch (error) {
      const data = getValidationErrors(error);
      if (data) {
        return toSubmissionErrors(data, ['gid', 'allow_outside_range']);
      }
    }
  };

  return (
    <Form<FormValues>
      onSubmit={onSubmit}
      render={({
        handleSubmit,
        submitting,
        hasValidationErrors,
        submitError,
        dirtySinceLastSubmit,
      }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              group.gid == null
                ? translate('Set GID of {name}', { name: group.name })
                : translate('Change GID of {name}', { name: group.name })
            }
            footer={
              <SubmitButton
                disabled={hasValidationErrors}
                submitting={submitting}
                label={
                  group.gid == null
                    ? translate('Set GID')
                    : translate('Change GID')
                }
              />
            }
          >
            {group.gid == null ? (
              <AlertItem
                variant="info"
                className="mb-4"
                title={translate(
                  'The group has no GID yet. The GID you set is the one it gets.',
                )}
              />
            ) : (
              <AlertItem
                variant="warning"
                className="mb-4"
                title={translate('The group currently has GID {gid}.', {
                  gid: group.gid,
                })}
                body={
                  <ul className="mb-0 ps-4">
                    <li>
                      {translate(
                        'Files on shared storage keep the old GID until they are changed with chgrp; renumbering them is up to you.',
                      )}
                    </li>
                    <li>
                      {translate(
                        'The old GID stays reserved: Waldur does not hand it to another project.',
                      )}
                    </li>
                  </ul>
                }
              />
            )}
            {submitError && !dirtySinceLastSubmit && (
              <AlertItem variant="error" title={submitError} className="mb-4" />
            )}
            <NumberGroup
              name="gid"
              label={translate('New GID')}
              required
              validate={validateGid}
              disabled={submitting}
            />
            <OutsideRangeField disabled={submitting} />
          </ModalDialog>
        </form>
      )}
    />
  );
};

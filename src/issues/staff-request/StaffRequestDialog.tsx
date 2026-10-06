import { ChatCircleTextIcon } from '@phosphor-icons/react';
import { FunctionComponent, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  Issue,
  IssueRequest,
  supportIssuesCreate,
  usersList,
} from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { ENV } from '@/core/config';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { AsyncSelectGroup, StringGroup, SubmitButton, TextGroup } from '@/form';
import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { router } from '@/router';
import { useNotify } from '@/store/notify';
import { useUser } from '@/workspace/hooks';

import { useRequestTypes } from '../api';
import { TypeField } from '../create/TypeField';
import { IssueTypeChoice, mapRequestTypesToChoices } from '../types/constants';

export interface StaffRequestRecipient {
  url: string;
  uuid: string;
  full_name?: string;
  username?: string;
  email?: string;
}

export interface StaffRequestFormData {
  recipient?: StaffRequestRecipient;
  type?: IssueTypeChoice;
  summary: string;
  message: string;
}

/**
 * No `customer`, `project` or `resource`: the caller can only see a request
 * that is unscoped. No `is_reported_manually` either — leaving it out is what
 * makes the backend take `caller` from the payload instead of the sender.
 */
export const constructStaffRequestPayload = (
  formData: StaffRequestFormData,
): IssueRequest => ({
  type: formData.type.id,
  summary: formData.summary,
  caller: formData.recipient.url,
  first_comment: formData.message,
});

// A deactivated user can neither see the request nor answer it.
const activeUserAutocomplete = createLoadOptions(usersList, 'full_name', {
  field: ['full_name', 'url', 'username', 'email', 'uuid'],
  o: ['full_name'],
  is_active: true,
});

const formatRecipient = (option: StaffRequestRecipient) => {
  const name = option.full_name || option.username;
  return option.email ? `${name} (${option.email})` : name;
};

interface StaffRequestDialogProps {
  resolve: {
    recipient?: StaffRequestRecipient;
    refetch?: () => void;
  };
}

export const StaffRequestDialog: FunctionComponent<StaffRequestDialogProps> = ({
  resolve,
}) => {
  const currentUser = useUser();
  const { showSuccess } = useNotify();
  const { data: requestTypes, isLoading, error } = useRequestTypes();

  const issueTypes = useMemo(
    () => (requestTypes ? mapRequestTypesToChoices(requestTypes) : []),
    [requestTypes],
  );

  // The form is only mounted once the types are loaded, so this is computed
  // with the default type already in it and never reinitializes the form.
  const initialValues = useMemo<Partial<StaffRequestFormData>>(
    () => ({ recipient: resolve.recipient, type: issueTypes[0] }),
    [resolve.recipient, issueTypes],
  );

  const { mutateAsync: createIssue } = useManagedMutation<
    Issue,
    any,
    StaffRequestFormData
  >({
    mutationFn: async (formData) => {
      const response = await supportIssuesCreate({
        body: constructStaffRequestPayload(formData),
      });
      return response.data;
    },
    onSuccess: (issue) => {
      showSuccess(
        translate('Request {requestId} has been created.', {
          requestId: issue.key,
        }),
      );
      router.stateService.go('support.detail', { issue_uuid: issue.uuid });
    },
    refetch: resolve.refetch,
    errorMessage: translate('Unable to create request.'),
  });

  const validateRecipient = (value?: StaffRequestRecipient) =>
    required(value) ||
    (value.uuid === currentUser?.uuid
      ? translate('You cannot address a request to yourself.')
      : undefined);

  const noTypes = !isLoading && (Boolean(error) || issueTypes.length === 0);
  const showTypeSelector =
    ENV.plugins.WALDUR_SUPPORT?.DISPLAY_REQUEST_TYPE && issueTypes.length > 1;

  return (
    <Form<StaffRequestFormData>
      onSubmit={(values) => createIssue(values)}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Open support request')}
            subtitle={translate(
              'Start a conversation with a user. They see the request in their support list and can reply to it.',
            )}
            iconNode={<ChatCircleTextIcon weight="bold" />}
            iconColor="success"
            footer={
              <>
                <CloseDialogButton variant="tertiary" className="flex-equal" />
                <SubmitButton
                  disabled={invalid || submitting || isLoading || noTypes}
                  submitting={submitting}
                  label={translate('Send')}
                  className="flex-equal"
                />
              </>
            }
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : noTypes ? (
              <AlertItem
                type="floating"
                variant="warning"
                title={translate('Service desk configuration incomplete')}
                body={translate(
                  'Unable to create support request. No request types are available.',
                )}
              />
            ) : (
              <>
                <AsyncSelectGroup
                  name="recipient"
                  label={translate('Recipient')}
                  placeholder={translate('Select user...')}
                  required={true}
                  validate={validateRecipient}
                  defaultOptions={true}
                  getOptionValue={(option) => option.url}
                  getOptionLabel={formatRecipient}
                  loadOptions={activeUserAutocomplete}
                  isDisabled={submitting}
                  isClearable={false}
                  noOptionsMessage={() => translate('No users found')}
                />
                {showTypeSelector && (
                  <TypeField issueTypes={issueTypes} isDisabled={submitting} />
                )}
                <StringGroup
                  name="summary"
                  label={translate('Subject')}
                  required={true}
                  validate={required}
                  disabled={submitting}
                />
                <TextGroup
                  name="message"
                  label={translate('Message')}
                  description={translate(
                    'Posted as the first comment of the request. The recipient is notified the same way as for any other comment, and their reply comes back to you.',
                  )}
                  required={true}
                  validate={required}
                  rows={5}
                  disabled={submitting}
                />
              </>
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};

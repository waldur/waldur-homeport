import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { useCallback } from 'react';
import { reduxForm } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { fixURL } from '@waldur/core/api';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { required } from '@waldur/core/validators';
import { SelectField, SubmitButton } from '@waldur/form';
import { FormContainer } from '@waldur/form/FormContainer';
import { StringField } from '@waldur/form/StringField';
import { translate } from '@waldur/i18n';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { RoleEnum } from '@waldur/permissions/enums';
import { createProposalReview, getAllCallUsers } from '@waldur/proposals/api';
import { Proposal } from '@waldur/proposals/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

interface FormData {
  name: string;
  reviewer: string;
}

const getReviewerOptionLabel = (option) =>
  (option.user_full_name || option.user_username) +
  (option.user_email ? ` (${option.user_email})` : '');

export const CreateReviewDialog = reduxForm<
  FormData,
  { resolve: { proposal: Proposal } }
>({
  form: 'CreateReviewForm',
})((props) => {
  const {
    data: reviewers,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['CallReviewers', props.resolve.proposal.call_uuid],
    () =>
      getAllCallUsers(props.resolve.proposal.call_uuid, RoleEnum.CALL_REVIEWER),
    { staleTime: 3 * 60 * 1000 },
  );

  const router = useRouter();
  const processRequest = useCallback(
    (values: FormData, dispatch) => {
      if (!values.reviewer) return;
      const proposalUrl =
        props.resolve.proposal.url ||
        fixURL(`/proposal-proposals/${props.resolve.proposal.uuid}/`);
      Object.assign(values, {
        proposal: proposalUrl,
      });
      return createProposalReview(values)
        .then(() => {
          dispatch(
            showSuccess(translate('Proposal review created successfully')),
          );
          router.stateService.go('call-management.review-list');
        })
        .catch((error) => {
          dispatch(showErrorResponse(error, translate('Something went wrong')));
        });
    },
    [props.resolve, router],
  );

  return (
    <form onSubmit={props.handleSubmit(processRequest)}>
      <ModalDialog
        title={translate('Create review')}
        closeButton
        footer={
          <SubmitButton
            disabled={props.invalid}
            submitting={props.submitting || isLoading}
            label={translate('Create')}
          />
        }
      >
        <FormContainer submitting={props.submitting}>
          <StringField
            label={translate('Name')}
            name="name"
            required
            validate={required}
          />
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <LoadingErred
              loadData={refetch}
              message={translate('Unable to load call reviewers.')}
            />
          ) : (
            <SelectField
              name="reviewer"
              label={translate('Reviewer')}
              options={reviewers}
              getOptionLabel={getReviewerOptionLabel}
              getOptionValue={(option) =>
                `${ENV.apiEndpoint}api/users/${option.user_uuid}/`
              }
              simpleValue
              required
              validate={required}
            />
          )}
        </FormContainer>
      </ModalDialog>
    </form>
  );
});

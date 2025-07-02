import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { useCallback } from 'react';
import { reduxForm } from 'redux-form';
import {
  proposalProtectedCallsListUsersList,
  proposalReviewsCreate,
} from 'waldur-js-client';

import { getAllPages } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { required } from '@waldur/core/validators';
import { SelectField, SubmitButton } from '@waldur/form';
import { FormContainer } from '@waldur/form/FormContainer';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { RoleEnum } from '@waldur/permissions/enums';
import { CALL_REVIEWERS_QUERY_KEY } from '@waldur/proposals/constants';
import { Proposal } from '@waldur/proposals/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

interface FormData {
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
  } = useQuery({
    queryKey: [CALL_REVIEWERS_QUERY_KEY, props.resolve.proposal.call_uuid],

    queryFn: () =>
      getAllPages((page) =>
        proposalProtectedCallsListUsersList({
          path: { uuid: props.resolve.proposal.call_uuid },
          query: {
            page,
            role: RoleEnum.CALL_REVIEWER,
          },
        }),
      ),

    staleTime: 3 * 60 * 1000,
  });

  const router = useRouter();
  const processRequest = useCallback(
    async (values: FormData, dispatch) => {
      if (!values.reviewer) return;
      try {
        await proposalReviewsCreate({
          body: { proposal: props.resolve.proposal.url, ...values },
        });
        dispatch(
          showSuccess(translate('Proposal review created successfully')),
        );
        dispatch(closeModalDialog());
        router.stateService.go('call-management.review-list');
      } catch (error) {
        dispatch(showErrorResponse(error, translate('Something went wrong')));
      }
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

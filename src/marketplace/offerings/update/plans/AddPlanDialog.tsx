import { PlusCircleIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import { marketplacePlansCreate } from 'waldur-js-client';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { formatPlan } from '../../store/utils';

import { ADD_PLAN_FORM_ID, getBillingPeriods } from './constants';
import { PlanForm } from './PlanForm';

export const AddPlanDialog = connect<{}, {}, { resolve: { plan? } }>(
  (_, ownProps) => ({
    initialValues: ownProps.resolve.plan
      ? {
          ...ownProps.resolve.plan,
          name: translate('Clone of') + ' ' + ownProps.resolve.plan.name,
          unit: getBillingPeriods().find(
            ({ value }) => value === ownProps.resolve.plan.unit,
          ),
        }
      : undefined,
  }),
)(
  reduxForm<{}, { resolve: { offering; refetch } }>({
    form: ADD_PLAN_FORM_ID,
  })((props) => {
    const dispatch = useDispatch();
    const update = useCallback(
      async (formData) => {
        try {
          await marketplacePlansCreate({
            body: {
              offering: props.resolve.offering.url,
              ...formatPlan(formData),
            },
          });
          dispatch(
            showSuccess(translate('Plan has been created successfully.')),
          );
          await props.resolve.refetch();
          dispatch(closeModalDialog());
        } catch (error) {
          dispatch(
            showErrorResponse(error, translate('Unable to create plan.')),
          );
        }
      },
      [dispatch],
    );

    return (
      <form onSubmit={props.handleSubmit(update)}>
        <ModalDialog
          title={translate('Add plan')}
          footer={
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={translate('Create')}
            />
          }
          iconNode={<PlusCircleIcon weight="bold" />}
          iconColor="success"
        >
          <PlanForm />
        </ModalDialog>
      </form>
    );
  }),
);

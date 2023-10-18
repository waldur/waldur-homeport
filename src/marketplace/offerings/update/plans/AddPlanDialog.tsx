import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { createPlan } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
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
          const fixedComponents = props.resolve.offering.components
            .filter((c) => c.billing_type === 'fixed')
            .map((c) => c.type);
          const validComponents = props.resolve.offering.components.map(
            (c) => c.type,
          );
          await createPlan({
            offering: props.resolve.offering.url,
            ...formatPlan(formData, fixedComponents, validComponents),
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
        <Modal.Header>
          <Modal.Title>{translate('Add plan')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PlanForm offering={props.resolve.offering} />
        </Modal.Body>
        <Modal.Footer>
          <SubmitButton
            disabled={props.invalid}
            submitting={props.submitting}
            label={translate('Create')}
          />
        </Modal.Footer>
      </form>
    );
  }),
);

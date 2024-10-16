import { Eye } from '@phosphor-icons/react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import { translate } from '@waldur/i18n';
import { ORDER_FORM_ID } from '@waldur/marketplace/details/constants';
import { showOfferingPlanDescription } from '@waldur/marketplace/details/plan/actions';
import { RootState } from '@waldur/store/reducers';
import { ActionButton } from '@waldur/table/ActionButton';

interface PlanDescriptionButtonProps {
  showOfferingPlanDescription(planDescription: string): void;
  planDescription?: string;
  className?: string;
  formData: any;
}

export const PurePlanDescriptionButton = (
  props: PlanDescriptionButtonProps,
) => {
  let planDescription = '';
  if (
    props.formData &&
    props.formData.plan &&
    props.formData.plan.description
  ) {
    planDescription = (props.formData.plan.description as string).trim();
  }
  if (props.planDescription) {
    planDescription = props.planDescription.trim();
  }
  if (!planDescription) {
    return null;
  }
  return (
    <ActionButton
      title={translate('Details')}
      action={() => props.showOfferingPlanDescription(planDescription)}
      iconNode={<Eye />}
      className={props.className}
    />
  );
};

const mapStateToProps = (state: RootState, ownProps) => ({
  formData: getFormValues(ownProps.formId || ORDER_FORM_ID)(state),
});

const mapDispatchToProps = (dispatch) => ({
  showOfferingPlanDescription: (planDescription) =>
    dispatch(showOfferingPlanDescription(planDescription)),
});

export const PlanDescriptionButton = connect(
  mapStateToProps,
  mapDispatchToProps,
)(PurePlanDescriptionButton);

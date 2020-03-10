import * as React from 'react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import { withTranslation, TranslateProps } from '@waldur/i18n';
import { FORM_ID } from '@waldur/marketplace/details/constants';
import { showOfferingPlanDescription } from '@waldur/marketplace/details/plan/actions';
import { ActionButton } from '@waldur/table-react/ActionButton';

interface PlanDescriptionButtonProps extends TranslateProps {
  showOfferingPlanDescription(planDescription: string): void;
  planDescription?: string;
  className?: string;
  formData: any;
}

export const PurePlanDescriptionButton = withTranslation(
  (props: PlanDescriptionButtonProps) => {
    let planDescription = '';
    if (
      props.formData &&
      props.formData.plan &&
      props.formData.plan.description
    ) {
      planDescription = props.formData.plan.description;
    }
    if (props.planDescription) {
      planDescription = props.planDescription;
    }
    if (!planDescription) {
      return null;
    }
    return (
      <ActionButton
        title={props.translate('Details')}
        action={() => props.showOfferingPlanDescription(planDescription)}
        icon="fa fa-eye"
        className={props.className}
      />
    );
  },
);

const mapStateToProps = state => ({
  formData: getFormValues(FORM_ID)(state),
});

const mapDispatchToProps = dispatch => ({
  showOfferingPlanDescription: planDescription =>
    dispatch(showOfferingPlanDescription(planDescription)),
});

export const PlanDescriptionButton = connect(
  mapStateToProps,
  mapDispatchToProps,
)(PurePlanDescriptionButton);

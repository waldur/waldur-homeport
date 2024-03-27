import { VStepperFormStepProps } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { FormResourceRequestsStep } from '@waldur/proposals/proposal/create/resource-requests-step/FormResourceRequestsStep';

import { FormProjectDetailsStep } from './FormProjectDetailsStep';

export const FormEvaluateProjectDetailsStep = (
  props: VStepperFormStepProps,
) => {
  return (
    <div
      id={props.id}
      className="d-flex flex-column flex-lg-row-fluid gap-5 gap-lg-7"
    >
      <FormProjectDetailsStep
        title={translate('Project details')}
        id="step-project"
        change={props.change}
        params={props.params}
        observed={props.observed}
      />
      <FormResourceRequestsStep
        title={translate('Resource requests')}
        id="step-resource-requests"
        change={props.change}
        params={{ ...props.params, readOnly: true }}
        observed={props.observed}
      />
    </div>
  );
};

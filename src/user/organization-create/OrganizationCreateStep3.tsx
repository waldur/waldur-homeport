import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { WizardForm, WizardFormStepProps } from '@waldur/form/WizardForm';
import { translate } from '@waldur/i18n';

// Dummy loading step, implement together with auto-validation feature
export const OrganizationCreateStep3: FunctionComponent<WizardFormStepProps> = (
  props,
) => {
  return (
    <WizardForm {...props}>
      <div className="d-flex flex-column gap-5">
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-8 text-center">
            {translate('Auto validation results will be displayed here.')}
          </Card.Body>
        </Card>
      </div>
    </WizardForm>
  );
};

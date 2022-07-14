import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { PlanDescriptionButton } from '@waldur/marketplace/details/plan/PlanDescriptionButton';
import { PlanSelectField } from '@waldur/marketplace/details/plan/PlanSelectField';
import { Offering } from '@waldur/marketplace/types';

interface PlanFieldProps {
  offering?: Offering;
}

export const PlanField: FunctionComponent<PlanFieldProps> = (props) =>
  props.offering.plans.length > 0 ? (
    <Form.Group>
      <Form.Label>
        {translate('Plan')}
        <span className="text-danger"> *</span>
      </Form.Label>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flexGrow: 1 }}>
          <PlanSelectField
            plans={props.offering.plans.filter(
              (plan) => plan.archived === false,
            )}
          />
        </div>
        <PlanDescriptionButton className="btn btn-md btn-secondary pull-right ms-2" />
      </div>
    </Form.Group>
  ) : null;

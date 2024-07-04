import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { DetailsField } from '@waldur/marketplace/common/DetailsField';
import { PlanDescriptionButton } from '@waldur/marketplace/details/plan/PlanDescriptionButton';
import { PlanDetailsTable } from '@waldur/marketplace/details/plan/PlanDetailsTable';
import { OrderResponse } from '@waldur/marketplace/orders/types';
import { Offering } from '@waldur/marketplace/types';
import { NoResult } from '@waldur/navigation/header/search/NoResult';

interface PlanDetailsProps {
  order: OrderResponse;
  offering: Offering;
}

const renderValue = (value) => (value ? value : <>&mdash;</>);

export const PlanSection = (props: PlanDetailsProps) => {
  const { plan_name, plan_description } = props.order;
  if (!plan_name) {
    return (
      <Card>
        <Card.Header className="custom-card-header custom-padding-zero">
          <Card.Title>
            <h3>{translate('Limits')}</h3>
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <NoResult
            title={translate('No plans found for this order')}
            buttonTitle={null}
            message={null}
          />
        </Card.Body>
      </Card>
    );
  }
  return (
    <Card>
      <Card.Header className="custom-card-header custom-padding-zero">
        <Card.Title>
          <h3>
            {props.order.type === 'Create'
              ? translate('New plan')
              : translate('Plan')}
          </h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <DetailsField label={translate('Name')}>
          {renderValue(plan_name)}
        </DetailsField>
        {plan_description ? (
          <DetailsField label={translate('Description')}>
            <PlanDescriptionButton
              className="btn btn-sm btn-secondary"
              planDescription={plan_description}
            />
          </DetailsField>
        ) : null}
        <DetailsField>
          <PlanDetailsTable
            formGroupClassName="form-group row"
            columnClassName="col-sm-12"
            viewMode={true}
            order={props.order}
            offering={props.offering}
          />
        </DetailsField>
      </Card.Body>
    </Card>
  );
};

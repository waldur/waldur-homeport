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

const PlanCard = ({
  title,
  planName,
  planDescription,
  order,
  offering,
  type,
}) => (
  <Card className="card-bordered">
    <Card.Header className="custom-card-header custom-padding-zero">
      <Card.Title>
        <h3>{translate(title)}</h3>
      </Card.Title>
    </Card.Header>
    <Card.Body>
      <DetailsField label={translate('Name')}>
        {renderValue(planName)}
      </DetailsField>
      {planDescription ? (
        <DetailsField label={translate('Description')}>
          <PlanDescriptionButton
            className="btn btn-sm btn-secondary"
            planDescription={planDescription}
          />
        </DetailsField>
      ) : null}
      <DetailsField>
        <PlanDetailsTable
          formGroupClassName="form-group row"
          columnClassName="col-sm-12"
          viewMode={true}
          order={order}
          offering={offering}
          type={type}
        />
      </DetailsField>
    </Card.Body>
  </Card>
);

export const PlanSection = (props: PlanDetailsProps) => {
  const { plan_name, plan_description, old_plan_name } = props.order;
  if (!plan_name) {
    return (
      <Card className="card-bordered">
        <Card.Header className="custom-card-header custom-padding-zero">
          <Card.Title>
            <h3>{translate('Plan')}</h3>
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
    <>
      {props.order.type === 'Update' ? (
        <>
          <PlanCard
            title="Old plan"
            planName={old_plan_name}
            planDescription={plan_description}
            order={props.order}
            offering={props.offering}
            type="old"
          />
          <hr />
          <PlanCard
            title="New plan"
            planName={plan_name}
            planDescription={plan_description}
            order={props.order}
            offering={props.offering}
            type="new"
          />
        </>
      ) : (
        <PlanCard
          title="Plan"
          planName={plan_name}
          planDescription={plan_description}
          order={props.order}
          offering={props.offering}
          type="new"
        />
      )}
    </>
  );
};

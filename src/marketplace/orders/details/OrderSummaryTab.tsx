import { Card } from 'react-bootstrap';
import { OrderDetails, PublicOfferingDetails } from 'waldur-js-client';

import { FieldWithCopy } from '@waldur/core/FieldWithCopy';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { DetailsField } from '@waldur/marketplace/common/DetailsField';
import { PlanDetailsTable } from '@waldur/marketplace/details/plan/PlanDetailsTable';

import { ExportOrderComponentsButton } from './ExportOrderComponentsButton';
import { OrderSummaryMessage } from './OrderSummaryMessage';

const renderValue = (value) => (value ? value : <>&mdash;</>);

export const OrderSummaryTab = ({
  order,
  offering,
}: {
  order: OrderDetails;
  offering: PublicOfferingDetails;
}) => {
  return (
    <>
      <FormTable.Card
        className="card-bordered"
        title={translate('Order summary')}
        actions={<ExportOrderComponentsButton />}
      >
        <FormTable detailsMode>
          <FormTable.Item label={translate('Order ID')} value={order.slug} />
          <FormTable.Item
            label={translate('Description')}
            value={<OrderSummaryMessage order={order} offering={offering} />}
          />
          {order.request_comment && (
            <FormTable.Item
              label={translate('PO reference')}
              value={<FieldWithCopy value={order.request_comment} />}
            />
          )}
        </FormTable>
      </FormTable.Card>

      <Card className="card-bordered">
        <Card.Header className="custom-card-header custom-padding-zero">
          <Card.Title>
            <h3>{translate('Accounting')}</h3>
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <DetailsField label={translate('Plan')}>
            {renderValue(order.plan_name)}
          </DetailsField>
          <DetailsField>
            <PlanDetailsTable
              formGroupClassName="form-group row"
              columnClassName="col-sm-12"
              viewMode={true}
              order={order}
              offering={offering}
              type="new"
            />
          </DetailsField>
        </Card.Body>
      </Card>
    </>
  );
};

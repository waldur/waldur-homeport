import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { useShouldConcealPrices } from '@waldur/marketplace/common/useShouldConcealPrices';
import { PlanDetailsTable } from '@waldur/marketplace/details/plan/PlanDetailsTable';
import { OrderFieldEditButton } from '@waldur/marketplace/orders/details/OrderFieldEditButton';

import {
  OrderTypeBasedProps,
  RequestedByField,
  RequestCommentField,
} from './OrderCommonFields';

export const ResourceCreation = ({
  order,
  offering,
  editable,
}: OrderTypeBasedProps) => {
  const shouldConcealPrices = useShouldConcealPrices(order.project_uuid);

  return (
    <>
      <FormTable>
        <RequestedByField order={order} formTableItem />
        <RequestCommentField order={order} formTableItem />
        <FormTable.Item
          label={translate('Start date')}
          value={order.start_date || translate('Not set')}
          actions={
            editable && (
              <OrderFieldEditButton
                order={order}
                offering={offering}
                name="start_date"
              />
            )
          }
        />
      </FormTable>
      <PlanDetailsTable
        formGroupClassName="form-group row"
        columnClassName="col-sm-12"
        viewMode
        order={order}
        offering={offering}
        type="new"
        concealBillingInfo={shouldConcealPrices}
      />
    </>
  );
};

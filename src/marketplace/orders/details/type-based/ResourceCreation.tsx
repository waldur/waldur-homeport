import { PlanDetailsTable } from '@waldur/marketplace/details/plan/PlanDetailsTable';

import {
  OrderTypeBasedProps,
  RequestedByField,
  RequestCommentField,
} from './OrderCommonFields';

export const ResourceCreation = ({ order, offering }: OrderTypeBasedProps) => {
  return (
    <>
      <RequestedByField order={order} />
      <RequestCommentField order={order} />
      <PlanDetailsTable
        formGroupClassName="form-group row"
        columnClassName="col-sm-12"
        viewMode
        order={order}
        offering={offering}
        type="new"
      />
    </>
  );
};

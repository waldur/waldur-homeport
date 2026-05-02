import { OrderDetails, PublicOfferingDetails } from 'waldur-js-client';

import { CompactEditButton } from '@/form/CompactEditButton';
import { useModal } from '@/modal/actions';

import { EditOrderFieldDialog } from './EditOrderFieldDialog';

interface OrderFieldEditButtonProps {
  order: OrderDetails;
  offering: PublicOfferingDetails;
  name: 'start_date' | 'limits';
  component?: string;
  title?: string;
  disabled?: boolean;
}

export const OrderFieldEditButton = (props: OrderFieldEditButtonProps) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(EditOrderFieldDialog, {
      resolve: {
        order: props.order,
        offering: props.offering,
        name: props.name,
        component: props.component,
      },
      initialValues:
        props.name === 'start_date'
          ? { start_date: props.order.start_date }
          : { limits: props.order.limits },
      size: 'lg',
    });
  };

  return <CompactEditButton onClick={callback} disabled={props.disabled} />;
};

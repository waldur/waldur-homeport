import { FunctionComponent } from 'react';
import { Container, Table } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { OrderItemStateCell } from '@waldur/marketplace/orders/item/list/OrderItemStateCell';
import { OrderItemTypeCell } from '@waldur/marketplace/orders/item/list/OrderItemTypeCell';
import { ResourceNameField } from '@waldur/marketplace/orders/item/list/ResourceNameField';
import { RowNameField } from '@waldur/marketplace/orders/item/list/RowNameField';
import { SupportOrderItemApproveButton } from '@waldur/marketplace/orders/item/list/SupportOrderItemApproveButton';
import { SupportOrderItemRejectButton } from '@waldur/marketplace/orders/item/list/SupportOrderItemRejectButton';
import { Field } from '@waldur/resource/summary';
import { renderFieldOrDash } from '@waldur/table/utils';

export const SupportOrderItemsTable: FunctionComponent<{ order }> = ({
  order,
}) => (
  <>
    <Container>
      <Field
        label={translate('Project description')}
        value={order.project_description}
      />
    </Container>
    {order.items.length ? (
      <Table>
        <thead>
          <tr>
            <th>{translate('Offering')}</th>
            <th>{translate('Resource')}</th>
            <th>{translate('Type')}</th>
            <th>{translate('State')}</th>
            <th>{translate('Plan')}</th>
            <th>{translate('Actions')}</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index: number) => (
            <tr key={index}>
              <td>{<RowNameField row={item} order={order} />}</td>
              <td>{<ResourceNameField row={item} />}</td>
              <td>{<OrderItemTypeCell row={item} />}</td>
              <td>{<OrderItemStateCell row={item} />}</td>
              <td>{renderFieldOrDash(item.plan_name)}</td>
              <td>
                {item.state === 'done' ? null : (
                  <>
                    {item.state === 'executing' && (
                      <SupportOrderItemApproveButton
                        itemUuid={item.uuid}
                        orderUuid={order.uuid}
                      />
                    )}
                    {item.state !== 'terminated' &&
                      item.state !== 'terminating' && (
                        <SupportOrderItemRejectButton
                          itemUuid={item.uuid}
                          orderUuid={order.uuid}
                        />
                      )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    ) : (
      <p>{translate("Order doesn't have items")}</p>
    )}
  </>
);

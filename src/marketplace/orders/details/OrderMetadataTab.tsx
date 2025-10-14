import { FormattedHtml } from '@waldur/core/FormattedHtml';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { getDetailsComponent } from '@waldur/marketplace/common/registry';

export const OrderMetadataTab = ({ order, offering }) => {
  const DetailsComponent = getDetailsComponent(order.offering_type);
  return (
    <FormTable.Card title={translate('Metadata')}>
      <FormTable detailsMode>
        <FormTable.Item
          label={translate('Resource UUID')}
          value={order.marketplace_resource_uuid}
        />

        {order.backend_id && (
          <FormTable.Item
            label={translate('Backend ID')}
            value={order.backend_id}
          />
        )}
        <FormTable.Item
          label={translate('Provider name')}
          value={order.provider_name}
        />

        <FormTable.Item
          label={translate('Provider UUID')}
          value={order.provider_uuid}
        />

        <FormTable.Item
          label={translate('Offering UUID')}
          value={order.offering_uuid}
        />

        {offering.components.length > 0 && (
          <FormTable.Item
            label={translate('Components')}
            value={offering.components
              .map((component) => component.type)
              .join(', ')}
          />
        )}
        <FormTable.Item
          label={translate('Offering billable?')}
          value={order.offering_billable ? 'Yes' : 'No'}
        />

        <FormTable.Item
          label={translate('Offering description')}
          value={<FormattedHtml html={order.offering_description} />}
        />

        <FormTable.Item
          label={translate('Offering shared?')}
          value={order.offering_shared ? 'Yes' : 'No'}
        />

        <FormTable.Item
          label={translate('Offering type')}
          value={order.offering_type}
        />

        <FormTable.Item
          label={translate('Offering terms of service')}
          value={order.offering_terms_of_service}
        />

        {DetailsComponent && (
          <DetailsComponent order={order} offering={offering} />
        )}
      </FormTable>
    </FormTable.Card>
  );
};

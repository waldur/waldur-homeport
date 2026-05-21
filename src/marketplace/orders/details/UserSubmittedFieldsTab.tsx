import { FieldWithCopy } from '@/core/FieldWithCopy';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

export const UserSubmittedFieldsTab = ({ order }) => {
  const entries = order.attributes ? Object.entries(order.attributes) : [];
  const hasEntries = entries.length > 0;

  return (
    <FormTable.Card title={translate('User submitted fields')}>
      {hasEntries ? (
        <FormTable detailsMode>
          {entries.map(([key, value]) => (
            <FormTable.Item
              key={key}
              label={key}
              value={<FieldWithCopy value={JSON.stringify(value)} />}
            />
          ))}
        </FormTable>
      ) : (
        <NoResult
          title={translate('No user submitted fields')}
          message={translate(
            'This order was placed without any custom field values.',
          )}
          noAction
        />
      )}
    </FormTable.Card>
  );
};

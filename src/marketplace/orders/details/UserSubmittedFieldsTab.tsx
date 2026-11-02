import { PropertyCard, PropertyItem, PropertyList } from 'waldur-ui';

import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

export const UserSubmittedFieldsTab = ({ order }) => {
  const entries = order.attributes ? Object.entries(order.attributes) : [];
  const hasEntries = entries.length > 0;

  return (
    <PropertyCard title={translate('User submitted fields')}>
      {hasEntries ? (
        <PropertyList detailsMode>
          {entries.map(([key, value]) => (
            <PropertyItem
              key={key}
              label={key}
              value={JSON.stringify(value)}
              hasCopy
            />
          ))}
        </PropertyList>
      ) : (
        <NoResult
          title={translate('No user submitted fields')}
          message={translate(
            'This order was placed without any custom field values.',
          )}
          noAction
        />
      )}
    </PropertyCard>
  );
};

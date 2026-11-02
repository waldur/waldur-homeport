import { FunctionComponent } from 'react';
import { ProviderRequestedOffering } from 'waldur-js-client';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';

interface OwnProps {
  row: ProviderRequestedOffering;
}

export const OfferingRequestsListExpandableRow: FunctionComponent<OwnProps> = ({
  row,
}) => (
  <ExpandableContainer asTable>
    <PropertyList variant="summary" className="flex flex-col gap-6">
      {typeof row.attributes['limits'] === 'object' && (
        <PropertyList.Section title={translate('Components')}>
          {Object.entries(row.attributes['limits']).map(
            ([key, value]: [string, string]) => (
              <PropertyItem key={key} label={key} value={value} />
            ),
          )}
        </PropertyList.Section>
      )}
      <PropertyList.Section title={translate('Request details')}>
        <PropertyItem
          label={translate('Contact')}
          value={`${row.created_by_name} / ${row.created_by_email}`}
        />
        <PropertyItem label={translate('Message')} value={row.description} />
      </PropertyList.Section>
    </PropertyList>
  </ExpandableContainer>
);

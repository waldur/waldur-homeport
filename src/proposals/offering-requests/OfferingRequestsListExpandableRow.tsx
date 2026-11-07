import { FunctionComponent } from 'react';
import { ProviderRequestedOffering } from 'waldur-js-client';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { translate } from '@/i18n';
import { formatDemandAmount } from '@/proposals/provider-calls/offeringDemand';
import { getRequestedLines } from '@/proposals/provider-calls/requestedLines';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { OfferingRequestCommitments } from './OfferingRequestCommitments';

interface OwnProps {
  row: ProviderRequestedOffering;
}

export const OfferingRequestsListExpandableRow: FunctionComponent<OwnProps> = ({
  row,
}) => {
  const limits = row.attributes?.['limits'];
  const lines =
    limits && typeof limits === 'object'
      ? getRequestedLines(limits as Record<string, number>, row.components)
      : [];
  return (
    <ExpandableContainer>
      <div className="flex flex-col gap-6">
        {row.state === 'canceled' ? (
          <PropertyList variant="summary">
            {/* One row, above what was requested: why it was turned down. */}
            {/* eslint-disable-next-line waldur-custom/no-lone-property-item-in-list */}
            <PropertyItem
              label={translate('Rejected because')}
              value={row.rejection_reason}
              hideIfEmpty={false}
            />
          </PropertyList>
        ) : null}
        {lines.length ? (
          <PropertyList as="div" variant="summary">
            <div>
              <h6 className="mb-2.5">{translate('Requested amounts')}</h6>
              <PropertyList.Section>
                {lines.map((line) => (
                  <PropertyItem
                    key={line.key}
                    label={line.label}
                    value={formatDemandAmount(line.amount, line.unit)}
                  />
                ))}
              </PropertyList.Section>
            </div>
          </PropertyList>
        ) : null}
        <OfferingRequestCommitments row={row} />
        <PropertyList as="div" variant="summary">
          <div>
            <h6 className="mb-2.5">{translate('Request details')}</h6>
            <PropertyList.Section>
              <PropertyItem
                label={translate('Contact')}
                value={[row.created_by_name, row.created_by_email]
                  .filter(Boolean)
                  .join(' / ')}
                hideIfEmpty={false}
              />
              <PropertyItem
                label={translate('Message')}
                value={row.description}
                hideIfEmpty={false}
              />
            </PropertyList.Section>
          </div>
        </PropertyList>
      </div>
    </ExpandableContainer>
  );
};

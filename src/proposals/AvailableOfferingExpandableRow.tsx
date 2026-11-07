import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import {
  proposalPublicCallsList,
  PublicOfferingDetails,
} from 'waldur-js-client';

import { PropertyItem } from 'waldur-ui';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import { renderFieldOrDash } from '@/table/utils';

import { RoundCutoff } from './ExpandableRowParts';
import { getRoundsWithStatus } from './utils';

/** The components an applicant asks an amount of: those billed by limit. */
const requestableComponents = (offering: PublicOfferingDetails) =>
  (offering.components ?? []).filter(
    (component) => component.billing_type === 'limit',
  );

const OpenCalls: FC<{ offeringUuid: string }> = ({ offeringUuid }) => {
  const { data: calls, isLoading } = useQuery({
    queryKey: ['offering-open-calls', offeringUuid],
    queryFn: async () =>
      (
        await proposalPublicCallsList({
          query: { open_for_offering_uuid: offeringUuid, page_size: 50 },
        })
      ).data,
    staleTime: 60_000,
  });
  if (isLoading) {
    return <span className="text-quaternary">{translate('Loading…')}</span>;
  }
  if (!calls?.length) {
    return <>{renderFieldOrDash(null)}</>;
  }
  // One call a line: its name, then when its open round closes.
  return (
    <div className="flex flex-col gap-1">
      {calls.map((call) => {
        const next = getRoundsWithStatus(call.rounds ?? []).find(
          (round) => round.status.value === 'open',
        );
        return (
          <div key={call.uuid}>
            <Link
              state="public-call.details"
              params={{ call_uuid: call.uuid }}
              label={call.name}
            />
            {' · '}
            {next ? (
              <>
                {translate('Closes')} <RoundCutoff round={next} />
              </>
            ) : (
              translate('Open')
            )}
          </div>
        );
      })}
    </div>
  );
};

/** What an applicant needs to know of an offering before applying for it. */
export const AvailableOfferingExpandableRow: FC<{
  row: PublicOfferingDetails;
}> = ({ row }) => {
  const components = requestableComponents(row);
  const description = row.full_description || row.description;
  // Key/value rows, as other expandable rows show their details. Provider
  // and category are the list's own columns.
  return (
    <ExpandableContainer asTable>
      <PropertyItem
        label={translate('Description')}
        value={propVal.richText(description, { format: 'markdown' })}
        hideIfEmpty={false}
      />
      <PropertyItem
        label={translate('What you can request')}
        value={
          components.length ? (
            <div className="flex flex-col gap-1">
              {components.map((component) => (
                <div key={component.type}>
                  {component.measured_unit
                    ? `${component.name} (${component.measured_unit})`
                    : component.name}
                </div>
              ))}
            </div>
          ) : null
        }
        hideIfEmpty={false}
      />
      <PropertyItem
        label={translate('Open calls')}
        value={<OpenCalls offeringUuid={row.uuid} />}
      />
    </ExpandableContainer>
  );
};

import { translate } from '@/i18n';
import { TabbedPlanComponents } from '@/marketplace/details/plan/TabbedPlanComponents';
import { getRequestedPrepaidMonths } from '@/proposals/prepaidDuration';
import { ProposalResource } from '@/proposals/types';
import { Field } from '@/resource/summary';
import { BooleanField } from '@/table/BooleanField';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import { renderFieldOrDash } from '@/table/utils';

import { SlurmPlacementFields } from './SlurmPlacementFields';

const UserInputs = ({ callOffering, optionsValues }) => (
  <section>
    <table className="w-full">
      <tbody>
        {callOffering.options?.order?.map((key) => (
          <tr key={key}>
            <th className="md:w-4/12">
              {callOffering.options.options[key]?.label}:
            </th>
            <td className="md:w-8/12">
              {typeof optionsValues[key] === 'boolean' ? (
                <BooleanField value={optionsValues[key]} />
              ) : typeof optionsValues[key] === 'object' ? (
                optionsValues[key].name ||
                optionsValues[key].value ||
                JSON.stringify(optionsValues[key])
              ) : (
                renderFieldOrDash(optionsValues[key])
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </section>
);

export const ResourceRequestExpandableRow = ({
  row,
}: {
  row: ProposalResource;
}) => {
  // Requested limits live on the resource itself (row.limits), not inside
  // attributes — attributes only carries the offering option answers. Reading
  // limits from attributes left every request showing "Quantity: 0x" even
  // though the request had limits (e.g. cpu_hours / storage caps).
  // Fall back to attributes.limits for requests written before limits moved
  // to their own field; drop the fallback once those rows are migrated.
  const limits =
    row.limits && Object.keys(row.limits).length
      ? row.limits
      : row.attributes?.limits;
  const optionsValues = row.attributes;
  // Makes the prices below cover the whole subscription, as the table does —
  // including for requests that name it as an end date rather than a length,
  // which getRequestedPrepaidMonths measures for both.
  const prepaidMonths = getRequestedPrepaidMonths(row);

  return (
    <ExpandableContainer className="fluid">
      {/* Provider and category moved off the table: the progress rail narrows
          that panel, and they were pushing estimated cost and purchase order —
          what a reviewer is actually here for — behind a sideways scroll.
          Laid out with the same Field the details overview above uses, so the
          two blocks on one page read as the same kind of thing. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 text-sm mb-3">
        <div>
          <Field
            label={translate('Provider')}
            value={renderFieldOrDash(row.requested_offering.provider_name)}
            labelCol={5}
            valueCol={7}
          />
        </div>
        <div>
          <Field
            label={translate('Category')}
            value={renderFieldOrDash(row.requested_offering.category_name)}
            labelCol={5}
            valueCol={7}
          />
        </div>
        <SlurmPlacementFields attributes={row.attributes} />
      </div>
      <TabbedPlanComponents
        offering={row.requested_offering as any}
        plan={row.requested_offering.plan_details}
        limits={limits}
        prepaidDurationMonths={prepaidMonths}
        viewMode
        extraTabs={
          row.requested_offering.options?.order?.length > 0 && [
            {
              title: translate('User inputs'),
              eventKey: 'user-inputs',
              component: () => (
                <UserInputs
                  callOffering={row.requested_offering}
                  optionsValues={optionsValues}
                />
              ),
            },
          ]
        }
      />
    </ExpandableContainer>
  );
};

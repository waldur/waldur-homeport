import { translate } from '@/i18n';
import { TabbedPlanComponents } from '@/marketplace/details/plan/TabbedPlanComponents';
import { ProposalResource } from '@/proposals/types';
import { BooleanField } from '@/table/BooleanField';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import { renderFieldOrDash } from '@/table/utils';

const UserInputs = ({ callOffering, optionsValues }) => (
  <section>
    <table className="table-details w-100">
      <tbody>
        {callOffering.options?.order?.map((key) => (
          <tr key={key}>
            <th className="col-md-4">
              {callOffering.options.options[key]?.label}:
            </th>
            <td className="col-md-8">
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
  const limits = row.limits;
  const optionsValues = row.attributes;

  return (
    <ExpandableContainer>
      <TabbedPlanComponents
        offering={row.requested_offering as any}
        plan={row.requested_offering.plan_details}
        limits={limits}
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

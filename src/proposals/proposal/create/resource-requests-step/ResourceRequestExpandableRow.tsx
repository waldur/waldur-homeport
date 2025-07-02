import { translate } from '@waldur/i18n';
import { PlanDetailsTable2 } from '@waldur/marketplace/details/plan/PlanDetailsTable2';
import { ProposalResource } from '@waldur/proposals/types';
import { BooleanField } from '@waldur/table/BooleanField';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import { renderFieldOrDash } from '@waldur/table/utils';

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
  const { limits, ...optionsValues } = row.attributes;

  return (
    <ExpandableContainer>
      <PlanDetailsTable2
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

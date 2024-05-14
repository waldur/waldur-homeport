import { translate } from '@waldur/i18n';
import { PlanDetailsTable2 } from '@waldur/marketplace/details/plan/PlanDetailsTable2';
import { ProposalResource } from '@waldur/proposals/types';
import { BooleanField } from '@waldur/table/BooleanField';
import { renderFieldOrDash } from '@waldur/table/utils';

export const ResourceRequestExpandableRow = ({
  row,
}: {
  row: ProposalResource;
}) => {
  const { limits, ...optionsValues } = row.attributes;

  return (
    <>
      {row.requested_offering.options?.order?.length > 0 && (
        <section className="bg-light rounded p-6 mb-10">
          <h5 className="mb-6">{translate('User inputs')}</h5>
          <table className="table-details w-100">
            <tbody>
              {row.requested_offering.options?.order?.map((key) => (
                <tr key={key}>
                  <td className="col-md-4">
                    {row.requested_offering.options.options[key]?.label}
                  </td>
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
      )}

      <PlanDetailsTable2
        offering={row.requested_offering as any}
        plan={row.requested_offering.plan_details}
        limits={limits}
        viewMode
      />
    </>
  );
};

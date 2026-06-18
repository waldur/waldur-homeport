import { FC, useMemo } from 'react';
import { Table } from 'react-bootstrap';
import { useFormState } from 'react-final-form';
import { Resource } from 'waldur-js-client';

import { formatDate, parseDate } from '@/core/dateUtils';
import { StringGroup } from '@/form';
import { FormGroup } from '@/form';
import { translate } from '@/i18n';
import { getFormLimitParser } from '@/marketplace/common/registry';
import { OrderAttachmentField } from '@/marketplace/deploy/steps/OrderAttachmentField';
import { getPurchaseOrderConfig } from '@/marketplace/resources/common/purchaseOrderConfig';
import { Field as SummaryField } from '@/resource/summary';
import { WizardModal, WizardStepProps } from '@/wizard';

import { getMarketplaceResourceUuid } from '../actions/utils';

import { RenewalCostBreakdown } from './RenewalCostBreakdown';
import { RenewAllocationFormData } from './types';

const LimitChangesSummary: FC<{
  resource: Resource;
  newLimits: Record<string, number>;
}> = ({ resource, newLimits }) => {
  const changes = useMemo(() => {
    const limitParser = getFormLimitParser(resource.offering_type || '');
    const currentLimits = limitParser(resource.limits) || {};
    const components = resource.offering_components || [];
    return components
      .map((c) => ({
        name: c.name,
        type: c.type,
        unit: c.measured_unit,
        current: currentLimits[c.type] || 0,
        new: newLimits[c.type] || 0,
      }))
      .filter((c) => c.current !== c.new);
  }, [resource, newLimits]);

  if (changes.length === 0) {
    return (
      <p className="text-muted mb-4">
        {translate('No limit changes — current limits will be maintained.')}
      </p>
    );
  }

  return (
    <div className="mb-4">
      <h6 className="mb-2">{translate('Limit changes')}</h6>
      <Table size="sm" borderless className="mb-0">
        <thead>
          <tr className="border-bottom">
            <th>{translate('Component')}</th>
            <th className="text-end">{translate('Current')}</th>
            <th className="text-center">{translate('')}</th>
            <th className="text-end">{translate('New')}</th>
          </tr>
        </thead>
        <tbody>
          {changes.map((c) => (
            <tr key={c.type}>
              <td>{c.name}</td>
              <td className="text-end text-muted">
                {c.current} {c.unit}
              </td>
              <td className="text-center">→</td>
              <td className="text-end fw-semibold">
                {c.new} {c.unit}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export const Step3ReviewConfirm: FC<WizardStepProps> = (props) => {
  const resources = props.data?.resources;
  const resource: Resource = resources?.[0];
  const isMulti = resources && resources.length > 1;
  const { values } = useFormState<RenewAllocationFormData>();

  const extensionMonths = Number(values.extension_months) || 0;

  const newEndDate = resource?.end_date
    ? formatDate(parseDate(resource.end_date).plus({ months: extensionMonths }))
    : extensionMonths
      ? translate('{count} months from now', { count: extensionMonths })
      : 'N/A';

  const departmentToInvoice = [resource?.customer_name, resource?.project_name]
    .filter(Boolean)
    .join(' / ');

  const { showPurchaseOrder, isRequired } = getPurchaseOrderConfig(resource);

  const newLimits = values[getMarketplaceResourceUuid(resource)]?.limits || {};

  return (
    <WizardModal {...props}>
      {!isMulti && (
        <div className="mb-6">
          <SummaryField
            label={translate('Resource')}
            value={resource?.name}
            labelCol={4}
            valueCol={8}
            className="mb-3"
          />
          <SummaryField
            label={translate('Organization / Project')}
            value={departmentToInvoice}
            labelCol={4}
            valueCol={8}
            className="mb-3"
          />
          <SummaryField
            label={translate('Extension')}
            value={
              extensionMonths === 1
                ? translate('1 month')
                : translate('{count} months', { count: extensionMonths })
            }
            labelCol={4}
            valueCol={8}
            className="mb-3"
          />
          <SummaryField
            label={translate('New end date')}
            value={newEndDate}
            labelCol={4}
            valueCol={8}
            className="mb-3"
          />

          <hr className="my-4" />

          <LimitChangesSummary resource={resource} newLimits={newLimits} />

          <RenewalCostBreakdown
            resource={resource}
            extensionMonths={extensionMonths}
          />
        </div>
      )}

      {showPurchaseOrder && (
        <>
          <div style={{ maxWidth: 300 }}>
            <StringGroup
              label={translate('Comment')}
              description={translate(
                'Optional note for the service provider, e.g. a PO number.',
              )}
              name="request_comment"
              placeholder={translate('Optional')}
            />
          </div>
          <FormGroup
            label={translate('Purchase order document')}
            description={translate('Attach a PDF purchase order document.')}
            spaceless
          >
            <OrderAttachmentField required={isRequired} />
          </FormGroup>
        </>
      )}
    </WizardModal>
  );
};

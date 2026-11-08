import { FC, useMemo } from 'react';
import { useFormState } from 'react-final-form';
import { Resource } from 'waldur-js-client';

import {
  PropertyItem,
  PropertyList,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { formatDate, parseDate } from '@/core/dateUtils';
import { StringGroup } from '@/form';
import { FormGroup } from '@/form';
import { translate } from '@/i18n';
import { getFormLimitParser } from '@/marketplace/common/registry';
import { OrderAttachmentField } from '@/marketplace/deploy/steps/OrderAttachmentField';
import { getPurchaseOrderConfig } from '@/marketplace/resources/common/purchaseOrderConfig';
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
      <p className="text-quaternary mb-3">
        {translate('No limit changes — current limits will be maintained.')}
      </p>
    );
  }

  return (
    <div className="mb-3">
      <h6 className="mb-1.5">{translate('Limit changes')}</h6>
      <Table density="compact" scrollable={false} className="mb-0">
        <TableHeader>
          <TableRow className="border-b border-b-secondary">
            <TableHead>{translate('Component')}</TableHead>
            <TableHead className="text-end">{translate('Current')}</TableHead>
            <TableHead className="text-center">{translate('')}</TableHead>
            <TableHead className="text-end">{translate('New')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {changes.map((c) => (
            <TableRow key={c.type}>
              <TableCell>{c.name}</TableCell>
              <TableCell className="text-end text-quaternary">
                {c.current} {c.unit}
              </TableCell>
              <TableCell className="text-center">→</TableCell>
              <TableCell className="text-end">
                {c.new} {c.unit}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
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
        <div className="mb-5">
          <PropertyList variant="summary" termWidth="md" space={2.5}>
            <PropertyItem
              label={translate('Resource')}
              value={resource?.name}
            />
            <PropertyItem
              label={translate('Organization / Project')}
              value={departmentToInvoice}
            />
            <PropertyItem
              label={translate('Extension')}
              value={
                extensionMonths === 1
                  ? translate('1 month')
                  : translate('{count} months', { count: extensionMonths })
              }
            />
            <PropertyItem
              label={translate('New end date')}
              value={newEndDate}
            />
          </PropertyList>

          <hr className="my-3" />

          <LimitChangesSummary resource={resource} newLimits={newLimits} />

          <RenewalCostBreakdown
            resource={resource}
            extensionMonths={extensionMonths}
          />
        </div>
      )}

      {showPurchaseOrder && (
        <>
          <div className="max-w-75">
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

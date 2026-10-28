import { CaretLeftIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useFormState } from 'react-final-form';
import {
  adminArrowSettingsSaveSettings,
  ExportTypeCompatibility,
} from 'waldur-js-client';

import { AlertItem, Badge, BaseButton } from 'waldur-ui';

import { ExternalLink } from '@/core/ExternalLink';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Field } from '@/resource/summary';
import { SimpleTable } from '@/table/SimpleTable';
import { Column } from '@/table/types';
import { WizardModal, WizardStepProps } from '@/wizard';

import { arrowQueryKeys } from '../api';
import type { ArrowSetupFormValues } from '../types';

interface MappingRow {
  arrowRef: string;
  arrowCompany?: string;
  waldurName: string;
}

const getMappingColumns = (): Column<MappingRow>[] => [
  {
    title: translate('Arrow Reference'),
    render: ({ row }) => (
      <>
        {row.arrowRef}
        {row.arrowCompany && (
          <span className="text-quaternary ms-1.5">({row.arrowCompany})</span>
        )}
      </>
    ),
  },
  {
    title: translate('Waldur Organization'),
    render: ({ row }) => <>{row.waldurName}</>,
  },
];

const getExportTypeColumns = (): Column<ExportTypeCompatibility>[] => [
  {
    title: translate('Export Type'),
    render: ({ row }) => (
      <>
        <span className="font-medium">{row.name}</span>
        <br />
        <span className="text-quaternary small">{row.reference}</span>
      </>
    ),
  },
  {
    title: translate('Status'),
    render: ({ row }) =>
      row.recommended ? (
        <Badge variant="success" shape="pill" tone="outline">
          {translate('Recommended')}
        </Badge>
      ) : row.compatible ? (
        <Badge variant="primary" shape="pill" tone="outline">
          {translate('Compatible')}
        </Badge>
      ) : (
        <Badge variant="danger" shape="pill" tone="outline">
          {translate('Missing fields')}
        </Badge>
      ),
  },
  {
    title: translate('Fields'),
    render: ({ row }) => (
      <>
        <small className="text-quaternary">
          {translate('{found}/{total} required', {
            found: row.required_fields_found,
            total: row.required_fields_total,
          })}
          {', '}
          {translate('{found}/{total} important', {
            found: row.important_fields_found,
            total: row.important_fields_total,
          })}
        </small>
        {row.missing_required_fields.length > 0 && (
          <div className="mt-1">
            <small className="text-danger">
              {translate('Missing: {fields}', {
                fields: row.missing_required_fields.join(', '),
              })}
            </small>
          </div>
        )}
      </>
    ),
  },
];

export const Step3Preview: FC<WizardStepProps> = (props) => {
  const { values } = useFormState<ArrowSetupFormValues>();

  const handleSaveMutation = useManagedMutation<any, any, void>({
    mutationFn: () => {
      const customerMappings = Object.entries(values.selectedMappings).map(
        ([arrowRef, waldurUuid]) => ({
          arrow_reference: arrowRef,
          waldur_customer_uuid: waldurUuid,
        }),
      );

      return adminArrowSettingsSaveSettings({
        body: {
          api_url: values.api_url,
          api_key: values.api_key,
          customer_mappings: customerMappings,
        },
      });
    },

    successMessage: translate('Arrow integration configured successfully'),
    errorMessage: translate('Failed to save Arrow settings'),
    invalidateQueries: [{ queryKey: arrowQueryKeys.all }],
  });

  const mappingCount = Object.keys(values.selectedMappings).length;
  const partnerInfo = values.partnerInfo as Record<string, unknown> | null;
  const mappingRows: MappingRow[] = Object.entries(values.selectedMappings).map(
    ([arrowRef, waldurUuid]) => ({
      arrowRef,
      arrowCompany: values.customers.find((c) => c.reference === arrowRef)
        ?.companyName,
      waldurName:
        values.waldurCustomers.find((c) => c.uuid === waldurUuid)?.name ||
        waldurUuid,
    }),
  );

  const renderFooter = () => (
    <>
      <BaseButton
        variant="tertiary"
        className="min-w-[125px] me-auto"
        onClick={() => props.onPrev(values)}
        label={translate('Back')}
        iconNode={<CaretLeftIcon weight="bold" />}
        size="lg"
      />
      <CloseDialogButton className="min-w-[125px]" />
      <BaseButton
        pending={handleSaveMutation.isPending}
        label={translate('Save & Complete')}
        onClick={() => handleSaveMutation.mutate()}
        variant="primary"
        size="lg"
      />
    </>
  );

  return (
    <WizardModal {...props} renderFooter={renderFooter}>
      <h4 className="mb-3">{translate('Preview Settings')}</h4>
      <p className="text-quaternary mb-3">
        {translate(
          'Review the settings below before saving. These will configure the Arrow integration.',
        )}
      </p>

      <div className="card mb-3">
        <div className="card-header">
          <h5 className="mb-0">{translate('Connection')}</h5>
        </div>
        <div className="card-body">
          <Field
            label={translate('API URL')}
            value={<ExternalLink url={values.api_url} label={values.api_url} />}
          />
          <Field
            label={translate('Partner Name')}
            value={partnerInfo?.company_name as string}
          />
          <Field
            label={translate('Partner Reference')}
            value={partnerInfo?.reference as string}
          />
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header">
          <h5 className="mb-0">{translate('Customer Mappings')}</h5>
        </div>
        <div className="card-body">
          {mappingCount > 0 ? (
            <SimpleTable
              columns={getMappingColumns()}
              rows={mappingRows}
              rowKey="arrowRef"
            />
          ) : (
            <span className="text-quaternary">
              {translate('No customer mappings configured')}
            </span>
          )}
        </div>
      </div>

      {values.exportTypes.length > 0 && (
        <div className="card mb-3">
          <div className="card-header">
            <h5 className="mb-0">{translate('Available Export Types')}</h5>
          </div>
          <div className="card-body">
            <p className="text-quaternary small mb-2.5">
              {translate(
                'These billing export types are available from your Arrow account. Compatible types have all required fields.',
              )}
            </p>
            <SimpleTable
              columns={getExportTypeColumns()}
              rows={values.exportTypes}
              rowKey="reference"
            />
          </div>
        </div>
      )}

      <AlertItem
        type="floating"
        variant="info"
        title={translate(
          'Note: API credentials will be securely stored. You can add more customer mappings after setup.',
        )}
      />
    </WizardModal>
  );
};

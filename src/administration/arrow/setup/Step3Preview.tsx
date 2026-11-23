import { CaretLeftIcon } from '@phosphor-icons/react';
import { FC, useEffect } from 'react';
import { Field, useForm, useFormState } from 'react-final-form';
import {
  adminArrowSettingsSaveSettings,
  ExportTypeCompatibility,
} from 'waldur-js-client';

import {
  AlertItem,
  Badge,
  BaseButton,
  FormField,
  FormLabel,
  FormText,
  NativeSelect,
  PropertyList,
  PropertyItem,
  Card,
  CardContent,
  CardHeader,
} from 'waldur-ui';
import { WizardModal, WizardStepProps } from 'waldur-wizard';

import { BooleanGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { propVal } from '@/property/propertyFields';
import { SimpleTable } from '@/table/SimpleTable';
import { Column } from '@/table/types';

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

// Billing sync does nothing without an export type, so preselect the best
// one the account offers.
const getDefaultExportType = (types: ExportTypeCompatibility[]) =>
  (types.find((t) => t.recommended) || types.find((t) => t.compatible))
    ?.reference || '';

export const Step3Preview: FC<WizardStepProps> = (props) => {
  const { values } = useFormState<ArrowSetupFormValues>();
  const exportTypeReference =
    values.export_type_reference ?? getDefaultExportType(values.exportTypes);
  const form = useForm<ArrowSetupFormValues>();
  // Sync needs an export type: switching to None turns it off, so the
  // switch shows what will be saved.
  useEffect(() => {
    if (!exportTypeReference && values.sync_enabled) {
      form.change('sync_enabled', false);
    }
  }, [exportTypeReference, values.sync_enabled, form]);

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
          export_type_reference: exportTypeReference,
          sync_enabled: Boolean(exportTypeReference && values.sync_enabled),
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
        className="min-w-dialog-action me-auto"
        onClick={() => props.onPrev(values)}
        label={translate('Back')}
        iconNode={<CaretLeftIcon weight="bold" />}
        size="lg"
      />
      <CloseDialogButton />
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

      <Card className="mb-3">
        <CardHeader>
          <h5 className="mb-0">{translate('Connection')}</h5>
        </CardHeader>
        <CardContent>
          <PropertyList variant="summary">
            <PropertyItem
              label={translate('API URL')}
              value={propVal.url(values.api_url)}
            />
            <PropertyItem
              label={translate('Partner Name')}
              value={partnerInfo?.company_name as string}
            />
            <PropertyItem
              label={translate('Partner Reference')}
              value={partnerInfo?.reference as string}
            />
          </PropertyList>
        </CardContent>
      </Card>

      <Card className="mb-3">
        <CardHeader>
          <h5 className="mb-0">{translate('Customer Mappings')}</h5>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {values.exportTypes.length > 0 && (
        <Card className="mb-3">
          <CardHeader>
            <h5 className="mb-0">{translate('Available Export Types')}</h5>
          </CardHeader>
          <CardContent>
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
            <FormField controlId="arrow-export-type" className="mt-3">
              <FormLabel>{translate('Export type for billing sync')}</FormLabel>
              <Field<string>
                name="export_type_reference"
                defaultValue={exportTypeReference}
                // Keep '' (None) instead of final-form's default undefined,
                // which would fall back to the recommended type.
                parse={(value) => value}
              >
                {({ input }) => (
                  <NativeSelect {...input} id="arrow-export-type">
                    <option value="">{translate('None')}</option>
                    {values.exportTypes.map((t) => (
                      <option key={t.reference} value={t.reference}>
                        {t.name}
                      </option>
                    ))}
                  </NativeSelect>
                )}
              </Field>
              <FormText variant="muted">
                {translate(
                  'Billing sync reads invoices through this export type; without one it does nothing.',
                )}
              </FormText>
            </FormField>
          </CardContent>
        </Card>
      )}

      <BooleanGroup
        name="sync_enabled"
        label={translate('Enable automatic billing sync')}
        description={
          exportTypeReference
            ? translate('Can be changed later in the Arrow settings.')
            : values.exportTypes.length
              ? translate('Choose an export type first; sync needs one.')
              : translate(
                  'This Arrow account has no billing export types. Set one in the Arrow settings once it has.',
                )
        }
        disabled={!exportTypeReference}
      />

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

import { FC, useMemo } from 'react';
import { Alert } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { Badge } from '@/core/Badge';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { WizardForm, WizardFormStepProps } from '@/form/WizardForm';
import { translate } from '@/i18n';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { useDiscoverLicenses } from '../../api';

interface ArrowLicense {
  license_reference: string;
  vendor_name: string;
  offer_name: string;
  offer_sku: string;
  friendly_name: string;
  is_linked?: boolean;
}

export const Step4SelectLicenses: FC<WizardFormStepProps> = (props) => {
  const formValues = useSelector(getFormValues(props.form)) as {
    customerMapping?: { uuid: string };
    vendorOffering?: { arrow_vendor_name: string };
  };

  const customerMappingUuid = formValues?.customerMapping?.uuid;
  const vendorName = formValues?.vendorOffering?.arrow_vendor_name;
  const vendorNameLower = vendorName?.toLowerCase() || '';

  // Fetch licenses data using the existing hook
  const { data, isLoading } = useDiscoverLicenses(customerMappingUuid || '');

  // Process and filter the data
  const { availableLicenses, linkedLicenses } = useMemo(() => {
    if (!data) {
      return { availableLicenses: [], linkedLicenses: [] };
    }

    // Get set of already linked license references
    const linkedRefs = new Set<string>(
      (data.waldur_resources || [])
        .filter((r) => r.backend_id)
        .map((r) => r.backend_id),
    );

    // Filter licenses by vendor name and mark linked ones
    const allLicenses: ArrowLicense[] = (data.arrow_licenses || [])
      .filter((lic) => lic.vendor_name?.toLowerCase() === vendorNameLower)
      .map((lic) => ({
        ...lic,
        is_linked: linkedRefs.has(lic.license_reference),
      }));

    return {
      availableLicenses: allLicenses.filter((lic) => !lic.is_linked),
      linkedLicenses: allLicenses.filter((lic) => lic.is_linked),
    };
  }, [data, vendorNameLower]);

  // Table props for available licenses (with selection)
  const availableTableProps = useTable({
    table: 'ArrowLicensesAvailable',
    fetchData: () =>
      Promise.resolve({
        rows: availableLicenses,
        resultCount: availableLicenses.length,
      }),
    filter: useMemo(
      () => ({ customerMappingUuid, vendorName }),
      [customerMappingUuid, vendorName],
    ),
  });

  // Table props for linked licenses (display only)
  const linkedTableProps = useTable({
    table: 'ArrowLicensesLinked',
    fetchData: () =>
      Promise.resolve({
        rows: linkedLicenses,
        resultCount: linkedLicenses.length,
      }),
    filter: useMemo(
      () => ({ customerMappingUuid, vendorName }),
      [customerMappingUuid, vendorName],
    ),
  });

  if (isLoading) {
    return (
      <WizardForm {...props}>
        {() => (
          <div className="text-center py-10">
            <LoadingSpinner />
          </div>
        )}
      </WizardForm>
    );
  }

  return (
    <WizardForm {...props}>
      {() => (
        <div>
          <p className="text-muted mb-5">
            {translate(
              'Select the Arrow licenses to import as Waldur resources.',
            )}
          </p>

          {availableLicenses.length === 0 && linkedLicenses.length === 0 && (
            <Alert variant="info">
              {translate('No licenses found for vendor "{vendor}".', {
                vendor: vendorName,
              })}
            </Alert>
          )}

          {availableLicenses.length > 0 && (
            <Table<ArrowLicense>
              {...availableTableProps}
              rows={availableLicenses}
              columns={[
                {
                  title: translate('License'),
                  render: ({ row }) => (
                    <div>
                      <div className="fw-bold">
                        {row.friendly_name || row.offer_name}
                      </div>
                      <div className="text-muted small">
                        {row.license_reference}
                      </div>
                    </div>
                  ),
                },
                {
                  title: translate('SKU'),
                  render: ({ row }) => <>{row.offer_sku}</>,
                },
              ]}
              rowKey="license_reference"
              verboseName={translate('licenses')}
              hasActionBar={false}
              hasPagination={false}
              fieldType="checkbox"
              fieldName="selectedLicenses"
            />
          )}

          {linkedLicenses.length > 0 && (
            <div className="mt-5">
              <h6 className="text-muted mb-3">
                {translate('Already imported licenses')}
              </h6>
              <Table<ArrowLicense>
                {...linkedTableProps}
                rows={linkedLicenses}
                columns={[
                  {
                    title: translate('License'),
                    render: ({ row }) => (
                      <div className="text-muted">
                        <div>{row.friendly_name || row.offer_name}</div>
                        <div className="small">{row.license_reference}</div>
                      </div>
                    ),
                  },
                  {
                    title: translate('SKU'),
                    render: ({ row }) => (
                      <span className="text-muted">{row.offer_sku}</span>
                    ),
                  },
                  {
                    title: '',
                    render: () => (
                      <Badge variant="success" outline>
                        {translate('Imported')}
                      </Badge>
                    ),
                  },
                ]}
                rowKey="license_reference"
                verboseName={translate('imported licenses')}
                hasActionBar={false}
                hasPagination={false}
              />
            </div>
          )}
        </div>
      )}
    </WizardForm>
  );
};

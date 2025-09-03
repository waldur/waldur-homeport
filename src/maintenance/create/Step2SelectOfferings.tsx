import { FC, useEffect, useMemo } from 'react';
import { Field } from 'redux-form';

import { getUUID } from '@waldur/core/utils';
import { SelectField, TextField } from '@waldur/form';
import { WizardForm, WizardFormStepProps } from '@waldur/form/WizardForm';
import { translate } from '@waldur/i18n';
import { resetSelection, selectRow } from '@waldur/table/actions';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { MAINTENANCE_IMPACT_LEVEL, MaintenanceForm } from '../types';

const TABLE_ID = 'MaintenanceProviderOfferings';

const impactLevelOptions = Object.keys(MAINTENANCE_IMPACT_LEVEL).map((key) => ({
  label: MAINTENANCE_IMPACT_LEVEL[key],
  value: key,
}));

const baseFilter = {
  field: ['uuid', 'url', 'name'],
  shared: true,
};

const ImpactLevelField = ({ row }) => (
  <Field
    name={`impact_level.${row.uuid}`}
    component={SelectField}
    defaultOptions
    options={impactLevelOptions}
    noOptionsMessage={() => translate('No results found')}
    simpleValue
    className="my-1"
  />
);

const DescriptionField = ({ row }) => (
  <Field
    name={`impact_description.${row.uuid}`}
    component={TextField}
    placeholder={translate('Describe specific impact on this service...')}
    className="my-1"
    rows="2"
  />
);

export const Step2SelectOfferings: FC<WizardFormStepProps> = (props) => {
  const filter = useMemo(
    () =>
      props.data?.provider
        ? { ...baseFilter, customer_uuid: props.data?.provider?.customer_uuid }
        : baseFilter,
    [props.data?.provider],
  );

  const tableProps = useTable({
    table: TABLE_ID,
    fetchData: createFetcher('marketplace-provider-offerings'),
    filter,
  });

  return (
    <WizardForm {...props}>
      {(wizardProps) => {
        const formValues: MaintenanceForm = wizardProps.formValues;

        // NOTE: Can not use field feature of table, because of infinite rendering issue
        // Update offerings in the form state when selections change
        useEffect(() => {
          wizardProps.change('offerings', tableProps.selectedRows);
        }, [tableProps.selectedRows]);

        // Re-select the rows (on edit OR when back is clicked)
        useEffect(() => {
          wizardProps.dispatch(resetSelection(TABLE_ID));

          if (formValues.offerings?.length) {
            // Use current selections
            formValues.offerings.forEach((offering) => {
              wizardProps.dispatch(selectRow(TABLE_ID, offering));
            });
          } else if (
            formValues.template &&
            formValues.template_affected_offerings?.length
          ) {
            // Initiate selections from template offerings
            formValues.template_affected_offerings.forEach((item) => {
              wizardProps.dispatch(
                selectRow(TABLE_ID, {
                  uuid: getUUID(item.offering),
                  url: item.offering,
                  name: item.offering_name,
                }),
              );
            });
          } else if (formValues.affected_offerings?.length) {
            // Initiate selections
            formValues.affected_offerings.forEach((item) => {
              wizardProps.dispatch(
                selectRow(TABLE_ID, {
                  uuid: getUUID(item.offering),
                  url: item.offering,
                  name: item.offering_name,
                }),
              );
            });
          }
        }, []);

        return (
          <Table
            {...tableProps}
            columns={[
              {
                title: translate('Offering name'),
                render: ({ row }) => row.name,
              },
              {
                title: translate('Impact level'),
                render: ImpactLevelField,
                className: 'align-top',
              },
              {
                title: translate('Description'),
                render: DescriptionField,
              },
            ]}
            verboseName={translate('Offerings')}
            cardBordered={false}
            hasActionBar={false}
            fullWidth
            equalColWidth
            showPageSizeSelector={true}
            enableMultiSelect
          />
        );
      }}
    </WizardForm>
  );
};

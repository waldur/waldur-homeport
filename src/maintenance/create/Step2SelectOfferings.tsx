import { FC, useEffect, useMemo } from 'react';
import { Field } from 'react-final-form';
import { useForm, useFormState } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { marketplaceProviderOfferingsList } from 'waldur-js-client';

import { getUUID } from '@/core/utils';
import { SelectField, TextField } from '@/form';
import { translate } from '@/i18n';
import { resetSelection, selectRow } from '@/table/actions';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { WizardModal, WizardStepProps } from '@/wizard';

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

export const Step2SelectOfferings: FC<WizardStepProps> = (props) => {
  const form = useForm<MaintenanceForm>();
  const { values } = useFormState<MaintenanceForm>();
  const dispatch = useDispatch();

  const filter = useMemo(
    () =>
      props.data?.provider
        ? { ...baseFilter, customer_uuid: props.data?.provider?.customer_uuid }
        : baseFilter,
    [props.data?.provider],
  );

  const tableProps = useTable({
    table: TABLE_ID,
    fetchData: createFetcher(marketplaceProviderOfferingsList),
    filter,
  });

  // Update offerings in the form state when selections change
  useEffect(() => {
    form.change('offerings', tableProps.selectedRows);
  }, [tableProps.selectedRows, form]);

  // Re-select the rows (on edit OR when back is clicked)
  useEffect(() => {
    dispatch(resetSelection(TABLE_ID));

    if (values.offerings?.length) {
      // Use current selections
      values.offerings.forEach((offering) => {
        dispatch(selectRow(TABLE_ID, offering));
      });
    } else if (values.template && values.template_affected_offerings?.length) {
      // Initiate selections from template offerings
      values.template_affected_offerings.forEach((item) => {
        dispatch(
          selectRow(TABLE_ID, {
            uuid: getUUID(item.offering),
            url: item.offering,
            name: item.offering_name,
          }),
        );
      });
    } else if (values.affected_offerings?.length) {
      // Initiate selections
      values.affected_offerings.forEach((item) => {
        dispatch(
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
    <WizardModal {...props}>
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
    </WizardModal>
  );
};

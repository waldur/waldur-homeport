import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useState } from 'react';
import { Field, useForm, useFormState } from 'react-final-form';
import {
  MaintenanceAnnouncementTemplate,
  maintenanceAnnouncementsTemplateList,
  maintenanceAnnouncementTemplateOfferingsList,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { UI_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { required, url } from '@/core/validators';
import { SelectField, StringField, TextField } from '@/form';
import { DateField } from '@/form/DateField';
import { AsyncSelect } from '@/form/select';
import { TimeField } from '@/form/TimeField';
import { translate } from '@/i18n';
import { providerAutocomplete } from '@/marketplace/common/autocompletes';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { WizardModal, WizardStepProps } from '@/wizard';

import { MaintenanceForm } from '../types';
import { getMaintenanceOfferingFormFields } from '../utils';

const maintenanceTypeOptions = [
  { label: translate('Scheduled'), value: 1 },
  { label: translate('Emergency'), value: 2 },
  { label: translate('Security'), value: 3 },
  { label: translate('System upgrade'), value: 4 },
  { label: translate('Patch deployment'), value: 5 },
];

export const Step1CreateMessage: FC<WizardStepProps> = (props) => {
  const form = useForm<MaintenanceForm>();
  const { values } = useFormState<MaintenanceForm>();
  const [offeringsError, setOfferingsError] = useState<Error | null>(null);

  const showProviderPicker = !props.data?.provider;
  const providerUuid =
    values.service_provider?.uuid ?? props.data?.provider?.uuid;

  const {
    data: templates,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['MaintenanceTemplates', providerUuid],
    queryFn: () =>
      getAllPages((page) =>
        maintenanceAnnouncementsTemplateList({
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
            service_provider_uuid: providerUuid,
          },
        }),
      ),
    staleTime: UI_STALE_TIME,
    refetchOnWindowFocus: false,
    enabled: Boolean(providerUuid),
  });

  const fillFields = useCallback(
    async (template: MaintenanceAnnouncementTemplate) => {
      if (!template) {
        form.change('template_affected_offerings', null);
        return;
      }
      props.setLoading();
      setOfferingsError(null);

      form.change('name', template.name);
      form.change('maintenance_type', template.maintenance_type);
      form.change('message', template.message);

      // Fetch template affected offerings
      try {
        const templateOfferings = await getAllPages((page) =>
          maintenanceAnnouncementTemplateOfferingsList({
            query: {
              page_size: MAX_PAGE_SIZE,
              page,
              maintenance_template_uuid: template?.uuid,
              service_provider_uuid: providerUuid,
            },
          }),
        );
        const { affected_offerings, impact_level, impact_description } =
          getMaintenanceOfferingFormFields(templateOfferings);

        form.change('offerings', []);
        form.change('template_affected_offerings', affected_offerings as any);
        form.change('impact_level', impact_level);
        form.change('impact_description', impact_description);
      } catch (err) {
        setOfferingsError(err as Error);
      } finally {
        props.setLoading();
      }
    },
    [form, props, providerUuid],
  );

  const handleProviderChange = useCallback(
    (provider) => {
      form.change('service_provider', provider ?? undefined);
      form.change('template', undefined);
      form.change('offerings', []);
      form.change('template_affected_offerings', []);
    },
    [form],
  );

  return (
    <WizardModal {...props}>
      {!isLoading && error ? (
        <LoadingErred
          loadData={refetch}
          message={translate('Unable to load templates')}
        />
      ) : null}

      {showProviderPicker ? (
        <FormGroup
          label={translate('Service provider')}
          description={translate(
            'Choose the service provider this maintenance announcement applies to',
          )}
          required
        >
          <Field name="service_provider" validate={required}>
            {(fieldProps) => (
              <AsyncSelect
                placeholder={translate('Select service provider...')}
                loadOptions={providerAutocomplete}
                defaultOptions
                getOptionValue={(option) => option.customer_uuid}
                getOptionLabel={(option) => option.customer_name}
                value={fieldProps.input.value || null}
                onChange={(value) => {
                  fieldProps.input.onChange(value);
                  handleProviderChange(value);
                }}
                noOptionsMessage={() => translate('No service providers')}
                isClearable={true}
              />
            )}
          </Field>
        </FormGroup>
      ) : null}

      <FormGroup
        label={translate('Template')}
        description={translate(
          'Select a previously saved template to auto-fill form fields',
        )}
      >
        <Field
          name="template"
          component={SelectField}
          options={templates}
          isClearable
          getOptionLabel={(option) => option.name}
          getOptionValue={(option) => option.uuid}
          onChange={fillFields}
          isLoading={isLoading}
          isDisabled={!providerUuid}
        />
      </FormGroup>

      {values?.template && offeringsError ? (
        <LoadingErred
          loadData={() => fillFields(values.template)}
          message={translate('Unable to load template offerings')}
        />
      ) : null}

      <FormGroup label={translate('Name')} required>
        <Field
          name="name"
          component={StringField}
          placeholder={translate('e.g. Database maintance')}
          validate={required}
        />
      </FormGroup>

      <FormGroup label={translate('Maintenance type')} required>
        <Field
          name="maintenance_type"
          component={SelectField}
          options={maintenanceTypeOptions}
          isClearable={false}
          getOptionValue={(option) => option.value}
          getOptionLabel={(option) => option.label}
          validate={required}
          simpleValue
        />
      </FormGroup>

      <FormGroup label={translate('Message')} required>
        <Field
          name="message"
          component={TextField}
          placeholder={translate(
            'Describe the public details of the maintenance...',
          )}
          validate={required}
        />
      </FormGroup>

      {/* Dates - side by side */}
      <div className="row">
        <div className="col-sm-6">
          <FormGroup label={translate('Start date')} required>
            <Field
              name="scheduled_start_date"
              component={DateField}
              placeholder={translate('DD/MM/YYYY')}
              dateFormat="Y-m-d"
              validate={required}
            />
          </FormGroup>
        </div>
        <div className="col-sm-6">
          <FormGroup label={translate('Start time')} required>
            <Field
              name="scheduled_start_time"
              component={TimeField}
              placeholder={translate('HH:MM')}
              validate={required}
            />
          </FormGroup>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-6">
          <FormGroup label={translate('End date')} required>
            <Field
              name="scheduled_end_date"
              component={DateField}
              placeholder={translate('DD/MM/YYYY')}
              dateFormat="Y-m-d"
              validate={required}
            />
          </FormGroup>
        </div>
        <div className="col-sm-6">
          <FormGroup label={translate('End time')} required>
            <Field
              name="scheduled_end_time"
              component={TimeField}
              placeholder={translate('HH:mm')}
              validate={required}
            />
          </FormGroup>
        </div>
      </div>

      <FormGroup
        label={translate('External reference (Optional)')}
        description={translate('Link to external maintenance page or ticket')}
      >
        <Field
          name="external_reference_url"
          component={StringField}
          placeholder={translate(
            'e.g. https://status.example.com/maintenance/123',
          )}
          validate={url}
        />
      </FormGroup>

      <hr className="mb-7 mt-0" />

      <FormGroup
        label={translate('Internal notes (providers/staff visible only)')}
        spaceless
      >
        <Field
          name="internal_notes"
          component={TextField}
          placeholder={translate(
            'Add staff/provider-only information (not visible to customers)...',
          )}
        />
      </FormGroup>
    </WizardModal>
  );
};

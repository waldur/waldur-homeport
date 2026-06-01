import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useState } from 'react';
import { useForm, useFormState } from 'react-final-form';
import {
  MaintenanceAnnouncementTemplate,
  maintenanceAnnouncementsTemplateList,
  maintenanceAnnouncementTemplateOfferingsList,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { UI_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { required, url } from '@/core/validators';
import {
  SelectGroup,
  StringGroup,
  TextGroup,
  DateGroup,
  AsyncSelectGroup,
  TimeGroup,
} from '@/form';
import { translate } from '@/i18n';
import { providerAutocomplete } from '@/marketplace/common/autocompletes';
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
        <AsyncSelectGroup
          name="service_provider"
          label={translate('Service provider')}
          description={translate(
            'Choose the service provider this maintenance announcement applies to',
          )}
          required
          validate={required}
          placeholder={translate('Select service provider...')}
          loadOptions={providerAutocomplete}
          defaultOptions
          getOptionValue={(option) => option.customer_uuid}
          getOptionLabel={(option) => option.customer_name}
          onChange={handleProviderChange}
          noOptionsMessage={() => translate('No service providers')}
          isClearable={true}
        />
      ) : null}

      <SelectGroup
        name="template"
        options={templates}
        isClearable
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.uuid}
        onChange={fillFields}
        isLoading={isLoading}
        label={translate('Template')}
        description={translate(
          'Select a previously saved template to auto-fill form fields',
        )}
        isDisabled={!providerUuid}
      />
      {values?.template && offeringsError ? (
        <LoadingErred
          loadData={() => fillFields(values.template)}
          message={translate('Unable to load template offerings')}
        />
      ) : null}
      <StringGroup
        name="name"
        placeholder={translate('e.g. Database maintance')}
        validate={required}
        label={translate('Name')}
        required
      />
      <SelectGroup
        name="maintenance_type"
        options={maintenanceTypeOptions}
        isClearable={false}
        getOptionValue={(option) => option.value}
        getOptionLabel={(option) => option.label}
        validate={required}
        simpleValue
        label={translate('Maintenance type')}
        required
      />
      <TextGroup
        name="message"
        placeholder={translate(
          'Describe the public details of the maintenance...',
        )}
        validate={required}
        label={translate('Message')}
        required
      />
      {/* Dates - side by side */}
      <div className="row">
        <div className="col-sm-6">
          <DateGroup
            name="scheduled_start_date"
            placeholder={translate('DD/MM/YYYY')}
            dateFormat="Y-m-d"
            validate={required}
            label={translate('Start date')}
            required
          />
        </div>
        <div className="col-sm-6">
          <TimeGroup
            name="scheduled_start_time"
            label={translate('Start time')}
            placeholder={translate('HH:MM')}
            validate={required}
            required
          />
        </div>
      </div>
      <div className="row">
        <div className="col-sm-6">
          <DateGroup
            name="scheduled_end_date"
            placeholder={translate('DD/MM/YYYY')}
            dateFormat="Y-m-d"
            validate={required}
            label={translate('End date')}
            required
          />
        </div>
        <div className="col-sm-6">
          <TimeGroup
            name="scheduled_end_time"
            label={translate('End time')}
            placeholder={translate('HH:mm')}
            validate={required}
            required
          />
        </div>
      </div>
      <StringGroup
        name="external_reference_url"
        placeholder={translate(
          'e.g. https://status.example.com/maintenance/123',
        )}
        validate={url}
        label={translate('External reference (Optional)')}
        description={translate('Link to external maintenance page or ticket')}
      />
      <hr className="mb-7 mt-0" />
      <TextGroup
        name="internal_notes"
        placeholder={translate(
          'Add staff/provider-only information (not visible to customers)...',
        )}
        label={translate('Internal notes (providers/staff visible only)')}
        spaceless
      />
    </WizardModal>
  );
};

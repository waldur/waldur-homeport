import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useState } from 'react';
import { Col } from 'react-bootstrap';
import {
  MaintenanceAnnouncementTemplate,
  maintenanceAnnouncementsTemplateList,
  maintenanceAnnouncementTemplateOfferingsList,
} from 'waldur-js-client';

import { getAllPages } from '@waldur/core/api';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { required, url } from '@waldur/core/validators';
import {
  FormContainer,
  SelectField,
  StringField,
  TextField,
} from '@waldur/form';
import { DateField } from '@waldur/form/DateField';
import { TimeField } from '@waldur/form/TimeField';
import { WizardForm, WizardFormStepProps } from '@waldur/form/WizardForm';
import { translate } from '@waldur/i18n';

import { MAINTENANCE_TYPE } from '../types';
import { getMaintenanceOfferingFormFields } from '../utils';

const maintenanceTypeOptions = Object.keys(MAINTENANCE_TYPE).map((key) => ({
  label: MAINTENANCE_TYPE[key],
  value: Number(key),
}));

export const Step1CreateMessage: FC<WizardFormStepProps> = (props) => {
  const {
    data: templates,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['MaintenanceTemplates', props.data?.provider?.uuid],
    queryFn: () =>
      getAllPages((page) =>
        maintenanceAnnouncementsTemplateList({
          query: {
            page,
            page_size: 1000,
            service_provider_uuid: props.data?.provider?.uuid,
          },
        }),
      ),
    staleTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return (
    <WizardForm {...props}>
      {(wizardProps) => {
        const [offeringsError, setOfferingsError] = useState();

        const fillFields = useCallback(
          async (template: MaintenanceAnnouncementTemplate) => {
            if (!template) {
              wizardProps.change('template_affected_offerings', null);
              return;
            }
            wizardProps.setLoading(true);
            setOfferingsError(null);

            wizardProps.change('name', template.name);
            wizardProps.change('maintenance_type', template.maintenance_type);
            wizardProps.change('message', template.message);
            // Fetch template affected offerings
            try {
              const templateOfferings = await getAllPages((page) =>
                maintenanceAnnouncementTemplateOfferingsList({
                  query: {
                    page,
                    page_size: 1000,
                    maintenance_template_uuid: template?.uuid,
                  },
                }),
              );
              const { affected_offerings, impact_level, impact_description } =
                getMaintenanceOfferingFormFields(templateOfferings);

              wizardProps.change('offerings', []);
              wizardProps.change(
                'template_affected_offerings',
                affected_offerings,
              );
              wizardProps.change('impact_level', impact_level);
              wizardProps.change('impact_description', impact_description);
            } catch (err) {
              setOfferingsError(err);
            } finally {
              wizardProps.setLoading(false);
            }
          },
          [offeringsError, setOfferingsError],
        );

        return (
          <FormContainer
            submitting={wizardProps.submitting}
            className="size-lg"
            asRow
          >
            {!isLoading && error ? (
              <LoadingErred
                loadData={refetch}
                message={translate('Unable to load templates')}
              />
            ) : null}
            <SelectField
              name="template"
              label={translate('Template')}
              description={translate(
                'Select a previously saved template to auto-fill form fields',
              )}
              options={templates}
              isClearable
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.uuid}
              containerClassName="col-12"
              onChange={fillFields}
              isLoading={isLoading}
            />
            {wizardProps.formValues?.template && offeringsError ? (
              <LoadingErred
                loadData={() => fillFields(wizardProps?.formValues.template)}
                message={translate('Unable to load template offerings')}
              />
            ) : null}
            <StringField
              name="name"
              label={translate('Name')}
              placeholder={translate('e.g. Database maintance')}
              containerClassName="col-12"
              required
              validate={required}
            />
            <SelectField
              name="maintenance_type"
              label={translate('Maintenance type')}
              options={maintenanceTypeOptions}
              isClearable={false}
              getOptionValue={(option) => option.value}
              getOptionLabel={(option) => option.label}
              containerClassName="col-12"
              required
              validate={required}
              simpleValue
            />
            <TextField
              name="message"
              label={translate('Message')}
              placeholder={translate(
                'Describe the public details of the maintenance...',
              )}
              containerClassName="col-12"
              required
              validate={required}
            />

            {/* Dates */}
            <DateField
              label={translate('Start date')}
              name="scheduled_start_date"
              placeholder={translate('DD/MM/YYYY')}
              dateFormat="Y-m-d"
              required
              validate={required}
              containerClassName="col-sm-6"
            />
            <TimeField
              label={translate('Start time')}
              name="scheduled_start_time"
              placeholder={translate('HH:MM')}
              dateFormat="Y-m-d"
              required
              validate={required}
              containerClassName="col-sm-6"
            />
            <DateField
              label={translate('End date')}
              name="scheduled_end_date"
              placeholder={translate('DD/MM/YYYY')}
              dateFormat="Y-m-d"
              required
              validate={required}
              containerClassName="col-sm-6"
            />
            <TimeField
              label={translate('End time')}
              name="scheduled_end_time"
              placeholder={translate('HH:mm')}
              dateFormat="Y-m-d"
              required
              validate={required}
              containerClassName="col-sm-6"
            />

            <StringField
              name="external_reference_url"
              label={translate('External reference (Optional)')}
              placeholder={translate(
                'e.g. https://status.example.com/maintenance/123',
              )}
              description={translate(
                'Link to external maintenance page or ticket',
              )}
              containerClassName="col-12"
              validate={url}
            />

            <Col xs={12}>
              <hr className="mb-7 mt-0" />
            </Col>

            <TextField
              name="internal_notes"
              label={translate('Internal notes (providers/staff visible only)')}
              placeholder={translate(
                'Add staff/provider-only information (not visible to customers)...',
              )}
              containerClassName="col-12"
              spaceless
            />
          </FormContainer>
        );
      }}
    </WizardForm>
  );
};

import { PencilSimpleIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import {
  MaintenanceAnnouncement,
  MaintenanceAnnouncementRequest,
  maintenanceAnnouncementsCreate,
  maintenanceAnnouncementsUpdate,
  maintenanceAnnouncementOfferingsCreate,
  maintenanceAnnouncementOfferingsDestroy,
  maintenanceAnnouncementOfferingsPartialUpdate,
} from 'waldur-js-client';

import { parseDate } from '@waldur/core/dateUtils';
import { ProgressStep } from '@waldur/core/ProgressSteps';
import { getUUID } from '@waldur/core/utils';
import { WizardFormContainer } from '@waldur/form/WizardFormContainer';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { MaintenanceForm, MaintenanceFormDialogProps } from '../types';
import {
  getMaintenanceOfferings,
  MAINTENANCE_ANNOUNCEMENT_FORM_ID,
} from '../utils';

import { MaintenanceSaveAsDropdown } from './MaintenanceSaveAsDropdown';
import { Step1CreateMessage } from './Step1CreateMessage';
import { Step2SelectOfferings } from './Step2SelectOfferings';
import { Step3ReviewAndCreate } from './Step3ReviewAndCreate';

const WizardForms = [
  Step1CreateMessage,
  Step2SelectOfferings,
  Step3ReviewAndCreate,
];

const steps: ProgressStep[] = [
  {
    key: 'create',
    label: translate('Create message'),
    completed: false,
  },
  {
    key: 'offerings',
    label: translate('Select offerings'),
    completed: false,
  },
  {
    key: 'review',
    label: translate('Review and create'),
    completed: false,
  },
];

export const MaintenanceFormDialog: FC<MaintenanceFormDialogProps> = (
  props,
) => {
  const submitForm = useCallback(
    async (formData: MaintenanceForm, dispatch, formProps) => {
      try {
        const startTime = parseDate(formData.scheduled_start_time);
        const startDate = parseDate(formData.scheduled_start_date).set({
          hour: startTime.hour,
          minute: startTime.minute,
        });
        const endTime = parseDate(formData.scheduled_end_time);
        const endDate = parseDate(formData.scheduled_end_date).set({
          hour: endTime.hour,
          minute: endTime.minute,
        });

        const body: MaintenanceAnnouncementRequest = {
          name: formData.name,
          message: formData.message,
          scheduled_start: startDate.toISO(),
          scheduled_end: endDate.toISO(),
          service_provider: props.resolve.provider.url,
          maintenance_type: formData.maintenance_type,
          external_reference_url: formData.external_reference_url || '',
          internal_notes: formData.internal_notes || '',
        };

        const {
          newOfferings,
          updatedAffectedOfferings,
          removedAffectedOfferings,
        } = getMaintenanceOfferings(formData);

        let maintenance: MaintenanceAnnouncement;
        if (props.resolve?.maintenanceUuid) {
          // Edit current
          maintenance = await maintenanceAnnouncementsUpdate({
            path: { uuid: props.resolve.maintenanceUuid },
            body,
          }).then((res) => res.data);
        } else {
          // Add new
          maintenance = await maintenanceAnnouncementsCreate({
            body,
          }).then((res) => res.data);
        }

        const promisesNew = newOfferings.map((offering) => {
          return maintenanceAnnouncementOfferingsCreate({
            body: {
              maintenance: maintenance.url,
              offering: offering.url,
              impact_description: formData.impact_description?.[offering.uuid],
              impact_level: formData.impact_level[offering.uuid],
            },
          });
        });
        const promisesUpdate = updatedAffectedOfferings.map((item) => {
          const offeringUuid = getUUID(item.offering);
          return maintenanceAnnouncementOfferingsPartialUpdate({
            path: { uuid: item.uuid },
            body: {
              impact_description: formData.impact_description?.[offeringUuid],
              impact_level: formData.impact_level[offeringUuid],
            },
          });
        });
        const promisesRemove = removedAffectedOfferings.map((item) => {
          return maintenanceAnnouncementOfferingsDestroy({
            path: { uuid: item.uuid },
          });
        });

        await Promise.all(promisesRemove);
        await Promise.all(promisesUpdate);
        await Promise.all(promisesNew);

        if (props.resolve?.maintenanceUuid) {
          dispatch(showSuccess(translate('Maintenance edited successfully')));
        } else {
          dispatch(showSuccess(translate('Maintenance added successfully')));
        }

        formProps.destroy();
        if (props.resolve.refetch) await props.resolve.refetch();
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(showErrorResponse(error));
      }
    },
    [props.resolve.refetch],
  );

  return (
    <WizardFormContainer
      form={MAINTENANCE_ANNOUNCEMENT_FORM_ID}
      onSubmit={submitForm}
      submitLabel={translate('Confirm')}
      steps={steps}
      wizardForms={WizardForms}
      title={
        props.resolve?.maintenanceUuid
          ? translate('Edit maintenance')
          : translate('Add maintenance')
      }
      subtitle={translate(
        'This will automatically create a broadcast message and portal announcement when scheduled.',
      )}
      initialValues={props.initialValues}
      data={{ provider: props.resolve.provider }}
      actions={({ formValues }) => (
        <MaintenanceSaveAsDropdown
          formComponent={MaintenanceFormDialog}
          formValues={formValues}
          provider={props.resolve.provider}
          maintenanceUuid={props.resolve.maintenanceUuid}
          refetch={props.resolve.refetch}
        />
      )}
      modalProps={{
        iconNode: props.resolve?.maintenanceUuid ? (
          <PencilSimpleIcon weight="bold" />
        ) : (
          <PlusCircleIcon weight="bold" />
        ),
        iconColor: 'success',
        bodyClassName: 'h-500px',
      }}
    />
  );
};

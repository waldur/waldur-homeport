import {
  MaintenanceAnnouncementOffering,
  MaintenanceAnnouncementStateEnum,
} from 'waldur-js-client';

import { getUUID } from '@/core/utils';
import { translate } from '@/i18n';

import { MaintenanceForm } from './types';

export const MAINTENANCE_ANNOUNCEMENT_FORM_ID = 'MaintenanceAnnouncementForm';

/**
 * Validate a maintenance window tuple coming from the range picker.
 *
 * - Requires both start and end to be present (array of length 2 with Date values).
 * - End must be strictly after start.
 * - For new maintenances (no `maintenanceUuid`) both ends must be in the future.
 *
 * Returns a translated error string when invalid, or `undefined` when valid.
 */
export const validateWindow = (
  value: unknown,
  options: { maintenanceUuid?: string } = {},
): string | undefined => {
  if (!Array.isArray(value) || value.length !== 2) {
    return translate('Select a start and end date/time.');
  }
  const [start, end] = value as [unknown, unknown];
  if (!(start instanceof Date) || !(end instanceof Date)) {
    return translate('Select a start and end date/time.');
  }
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return translate('Select a start and end date/time.');
  }
  if (end.getTime() <= start.getTime()) {
    return translate('End must be after start.');
  }
  if (!options.maintenanceUuid) {
    const now = Date.now();
    if (start.getTime() < now || end.getTime() < now) {
      return translate('Start and end must be in the future.');
    }
  }
  return undefined;
};

export const getMaintenanceState = (
  state: MaintenanceAnnouncementStateEnum,
) => {
  switch (state) {
    case 'Draft':
      return { label: translate('Draft'), color: 'default' };
    case 'Scheduled':
      return { label: translate('Scheduled'), color: 'warning' };
    case 'In progress':
      return { label: translate('In progress'), color: 'info' };
    case 'Completed':
      return { label: translate('Completed'), color: 'success' };
    case 'Cancelled':
      return { label: translate('Cancelled'), color: 'danger' };

    default:
      return { label: state, color: 'default' };
  }
};

export const getMaintenanceOfferings = (
  props: Pick<
    MaintenanceForm,
    'offerings' | 'affected_offerings' | 'impact_description' | 'impact_level'
  >,
) => {
  const newOfferings = props.offerings.filter((offering) => {
    return !(props.affected_offerings || []).some(
      (exist) => exist.offering === offering.url,
    );
  });
  const updatedAffectedOfferings = (props.affected_offerings || []).filter(
    (exist) => {
      const current = props.offerings.find(
        (offering) => offering.url === exist.offering,
      );
      if (!current) return false;
      // compare impact_description and impact_level
      const newImpactDescription = props.impact_description[current.uuid];
      const newImpactLevel = props.impact_level[current.uuid];
      return (
        exist.impact_description !== newImpactDescription ||
        String(exist.impact_level) !== String(newImpactLevel)
      );
    },
  );
  const removedAffectedOfferings = (props.affected_offerings || []).filter(
    (exist) =>
      !props.offerings.some((offering) => offering.url === exist.offering),
  );

  return { newOfferings, updatedAffectedOfferings, removedAffectedOfferings };
};

export const getMaintenanceOfferingFormFields = (
  affectedOfferings: Pick<
    MaintenanceAnnouncementOffering,
    'offering' | 'impact_level' | 'impact_description'
  >[],
) => ({
  affected_offerings: affectedOfferings,
  impact_description: affectedOfferings.reduce((acc, item) => {
    acc[getUUID(item.offering)] = item.impact_description;
    return acc;
  }, {}),
  impact_level: affectedOfferings.reduce((acc, item) => {
    acc[getUUID(item.offering)] = String(item.impact_level);
    return acc;
  }, {}),
});

import {
  MaintenanceAnnouncementOffering,
  MaintenanceAnnouncementOfferingTemplate,
  MaintenanceAnnouncementTemplate,
  ServiceProvider,
} from 'waldur-js-client';

import { translate } from '@/i18n';

export const MAINTENANCE_TYPE = {
  1: translate('Scheduled'),
  2: translate('Emergency'),
  3: translate('Security'),
  4: translate('System upgrade'),
  5: translate('Patch deployment'),
};

export const MAINTENANCE_IMPACT_LEVEL = {
  1: translate('No impact'),
  2: translate('Degraded performance'),
  3: translate('Partial outage'),
  4: translate('Full outage'),
};

export interface MaintenanceForm {
  template?: MaintenanceAnnouncementTemplate; // Temporary field to hold selected template
  scheduled_start_date: string; // 'yyyy-mm-dd';
  scheduled_start_time: string; // 'hh:mm:ss';
  scheduled_end_time: string;
  scheduled_end_date: string;
  name: string;
  maintenance_type: keyof typeof MAINTENANCE_TYPE;
  message: string;
  internal_notes: string;
  external_reference_url?: string;
  /** for offerings table */
  offerings: Array<{ uuid; url; name }>; // Temporary field to hold selected offerings
  /** for edit offerings maintenance */
  affected_offerings: MaintenanceAnnouncementOffering[]; // Temporary field to hold initial affected offerings
  /** for edit offerings maintenance */
  template_affected_offerings: MaintenanceAnnouncementOfferingTemplate[]; // Temporary field to hold selected template affected offerings
  /** for offerings table */
  impact_level: Record<string, keyof typeof MAINTENANCE_IMPACT_LEVEL>;
  /** for offerings table */
  impact_description: Record<string, string>;
}
export interface MaintenanceFormDialogProps {
  resolve: {
    provider?: ServiceProvider;
    refetch;
    maintenanceUuid?: string;
  };
  initialValues?: Partial<MaintenanceForm>;
}

import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

import * as constants from '../constants';

const ReportSecurityIncidentDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ReportSecurityIncidentDialog" */ '@waldur/issues/security-incident/ReportSecurityIncidentDialog'
    ),
  'ReportSecurityIncidentDialog',
);

export const openReportSecurityIncidentDialog = (
  showProjectField,
  showResourceField,
) =>
  openModalDialog(ReportSecurityIncidentDialog, {
    resolve: { showProjectField, showResourceField },
  });

export const reportIncident = (formData) => ({
  type: constants.REPORT_INCIDENT,
  payload: formData,
});

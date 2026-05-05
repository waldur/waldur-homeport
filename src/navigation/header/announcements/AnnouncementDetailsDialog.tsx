import { FC } from 'react';
import { Table } from 'react-bootstrap';
import { AdminAnnouncement } from 'waldur-js-client';

import {
  ANNOUNCEMENT_ICON,
  getAnnouncementTypeLabel,
} from '@/administration/utils';
import { formatDateTime } from '@/core/dateUtils';
import { SafeMarkdown } from '@/core/SafeMarkdown';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { Field } from '@/resource/summary';
import { renderFieldOrDash } from '@/table/utils';

export const AnnouncementDetailsDialog: FC<{
  resolve: {
    announcement: AdminAnnouncement;
  };
}> = ({ resolve: { announcement } }) => {
  const icon = ANNOUNCEMENT_ICON[announcement.type];
  const isMaintenance = !!announcement.maintenance_uuid;

  // Determine if this is a long-form description (contains structured content)
  const hasStructuredContent =
    announcement.description &&
    (announcement.description.includes('##') ||
      announcement.description.includes('###') ||
      announcement.description.length > 200);

  const renderMaintenanceHeader = () => {
    if (!isMaintenance) return null;

    const headerParts = [];
    if (announcement.maintenance_service_provider) {
      headerParts.push(announcement.maintenance_service_provider);
    }
    if (announcement.maintenance_scheduled_start) {
      headerParts.push(
        `${translate('Ongoing Since')}: ${formatDateTime(announcement.maintenance_scheduled_start)}`,
      );
    }
    if (announcement.maintenance_scheduled_end) {
      headerParts.push(
        `${translate('Expected Completion')}: ${formatDateTime(announcement.maintenance_scheduled_end)}`,
      );
    }

    if (headerParts.length === 0) return null;

    return <div className="text-muted mb-3">{headerParts.join(', ')}</div>;
  };

  const renderMaintenanceFields = () => {
    if (!isMaintenance || hasStructuredContent) return null;

    return (
      <>
        {announcement.maintenance_service_provider && (
          <Field
            label={translate('Service Provider')}
            value={announcement.maintenance_service_provider}
          />
        )}
        {announcement.maintenance_scheduled_start && (
          <Field
            label={translate('Ongoing Since')}
            value={formatDateTime(announcement.maintenance_scheduled_start)}
          />
        )}
        {announcement.maintenance_scheduled_end && (
          <Field
            label={translate('Expected Completion')}
            value={formatDateTime(announcement.maintenance_scheduled_end)}
          />
        )}
      </>
    );
  };

  const renderStructuredContent = () => {
    if (!hasStructuredContent) return null;

    return (
      <div className="mb-4">
        <SafeMarkdown text={announcement.description} />
      </div>
    );
  };

  const renderMessageField = () => {
    // Only show message field for non-structured content
    if (hasStructuredContent) return null;

    return (
      <Field
        label={translate('Message')}
        value={<SafeMarkdown text={announcement.description} />}
      />
    );
  };

  const renderAffectedOfferings = () => {
    if (
      !announcement.maintenance_affected_offerings ||
      announcement.maintenance_affected_offerings.length === 0
    ) {
      return null;
    }

    return (
      <div className="mt-4">
        <h6>{translate('Affected Offerings')}:</h6>
        <Table size="sm" className="mt-2">
          <thead>
            <tr>
              <th>{translate('Offering Name')}</th>
              <th>{translate('Impact Level')}</th>
              <th>{translate('Description')}</th>
            </tr>
          </thead>
          <tbody>
            {announcement.maintenance_affected_offerings.map(
              (offering, index) => (
                <tr key={offering.uuid || index}>
                  <td>{renderFieldOrDash(offering.name)}</td>
                  <td>
                    {renderFieldOrDash(
                      offering.impact_level_display || offering.impact_level,
                    )}
                  </td>
                  <td>{renderFieldOrDash(offering.impact_description)}</td>
                </tr>
              ),
            )}
          </tbody>
        </Table>
      </div>
    );
  };

  const getTitle = () => {
    if (isMaintenance && announcement.maintenance_name) {
      return `${translate('Maintenance')}: ${announcement.maintenance_name}`;
    }
    return getAnnouncementTypeLabel(announcement.type);
  };

  return (
    <ModalDialog
      title={getTitle()}
      className="announcement-details"
      iconNode={<icon.icon weight="bold" />}
      iconColor={icon.variant}
    >
      {renderMaintenanceHeader()}
      {renderStructuredContent()}
      {renderMaintenanceFields()}
      {renderMessageField()}

      {!isMaintenance && (
        <>
          <Field
            label={translate('Active from')}
            value={formatDateTime(announcement.active_from)}
          />
          <Field
            label={translate('Active to')}
            value={formatDateTime(announcement.active_to)}
          />
        </>
      )}

      {renderAffectedOfferings()}
    </ModalDialog>
  );
};

import { FC } from 'react';
import {
  AdminAnnouncement,
  PublicMaintenanceAnnouncement,
} from 'waldur-js-client';

import { PropertyList, PropertyItem } from 'waldur-ui';

import {
  ANNOUNCEMENT_ICON,
  getAnnouncementTypeLabel,
} from '@/administration/utils';
import { formatDateTime } from '@/core/dateUtils';
import { SafeMarkdown } from '@/core/SafeMarkdown';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { propVal } from '@/property/propertyFields';
import { renderFieldOrDash } from '@/table/utils';

// MAINTENANCE_TYPE: Emergency = 2, Security = 3 map to the "danger" variant.
const isCriticalMaintenance = (type: number | undefined) =>
  type === 2 || type === 3;

/**
 * Reconciles the two SDK shapes the dialog can be opened with — an admin
 * announcement ({@link AdminAnnouncement}, maintenance fields prefixed) and a
 * public maintenance announcement ({@link PublicMaintenanceAnnouncement}, flat
 * native fields) — onto a common set of values for rendering.
 */
const normalize = (
  announcement: AdminAnnouncement | PublicMaintenanceAnnouncement,
) =>
  'message' in announcement
    ? {
        type: isCriticalMaintenance(announcement.maintenance_type)
          ? 'danger'
          : 'warning',
        description: announcement.message,
        isMaintenance: true,
        name: announcement.name,
        serviceProvider: announcement.service_provider_name,
        scheduledStart: announcement.scheduled_start,
        scheduledEnd: announcement.scheduled_end,
        activeFrom: undefined,
        activeTo: undefined,
        affectedOfferings: announcement.affected_offerings?.map((offering) => ({
          uuid: offering.uuid || undefined,
          name: offering.offering_name || undefined,
          impactLevel:
            typeof offering.impact_level === 'number'
              ? String(offering.impact_level)
              : undefined,
          impactLevelDisplay:
            (offering.impact_level_display as string) || undefined,
          impactDescription: offering.impact_description,
        })),
      }
    : {
        type: announcement.type ?? 'information',
        description: announcement.description,
        isMaintenance: Boolean(announcement.maintenance_uuid),
        name: announcement.maintenance_name,
        serviceProvider: announcement.maintenance_service_provider,
        scheduledStart: announcement.maintenance_scheduled_start,
        scheduledEnd: announcement.maintenance_scheduled_end,
        activeFrom: announcement.active_from,
        activeTo: announcement.active_to,
        affectedOfferings: announcement.maintenance_affected_offerings?.map(
          (offering) => ({
            uuid: offering.uuid || undefined,
            name: offering.name || undefined,
            impactLevel: offering.impact_level || undefined,
            impactLevelDisplay: offering.impact_level_display || undefined,
            impactDescription: offering.impact_description,
          }),
        ),
      };

export const AnnouncementDetailsDialog: FC<{
  resolve: {
    announcement: AdminAnnouncement | PublicMaintenanceAnnouncement;
  };
}> = ({ resolve: { announcement } }) => {
  const view = normalize(announcement);
  const icon = ANNOUNCEMENT_ICON[view.type];
  const isMaintenance = view.isMaintenance;

  // Determine if this is a long-form description (contains structured content)
  const hasStructuredContent =
    view.description &&
    (view.description.includes('##') ||
      view.description.includes('###') ||
      view.description.length > 200);

  // Without structured content the property list below already shows these.
  const renderMaintenanceHeader = () => {
    if (!isMaintenance || !hasStructuredContent) return null;

    const headerParts = [];
    if (view.serviceProvider) {
      headerParts.push(view.serviceProvider);
    }
    if (view.scheduledStart) {
      headerParts.push(
        `${translate('Scheduled start')}: ${formatDateTime(view.scheduledStart)}`,
      );
    }
    if (view.scheduledEnd) {
      headerParts.push(
        `${translate('Scheduled end')}: ${formatDateTime(view.scheduledEnd)}`,
      );
    }

    if (headerParts.length === 0) return null;

    return (
      <div className="text-quaternary mb-2.5">{headerParts.join(', ')}</div>
    );
  };

  const renderStructuredContent = () => {
    if (!hasStructuredContent) return null;

    return (
      <div className="mb-3">
        <SafeMarkdown text={view.description} />
      </div>
    );
  };

  const renderAffectedOfferings = () => {
    if (!view.affectedOfferings || view.affectedOfferings.length === 0) {
      return null;
    }

    return (
      <div className="mt-3">
        <h6>{translate('Affected Offerings')}:</h6>
        <div className="table-responsive mt-1.5">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>{translate('Offering Name')}</th>
                <th>{translate('Impact Level')}</th>
                <th>{translate('Description')}</th>
              </tr>
            </thead>
            <tbody>
              {view.affectedOfferings.map((offering, index) => (
                <tr key={offering.uuid || index}>
                  <td>{renderFieldOrDash(offering.name)}</td>
                  <td>
                    {renderFieldOrDash(
                      offering.impactLevelDisplay || offering.impactLevel,
                    )}
                  </td>
                  <td>{renderFieldOrDash(offering.impactDescription)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const getTitle = () => {
    if (isMaintenance && view.name) {
      return `${translate('Maintenance')}: ${view.name}`;
    }
    return getAnnouncementTypeLabel(view.type);
  };

  return (
    <ModalDialog
      title={getTitle()}
      iconNode={<icon.icon weight="bold" />}
      iconColor={icon.variant}
    >
      {renderMaintenanceHeader()}
      {renderStructuredContent()}

      {isMaintenance && !hasStructuredContent && (
        <PropertyList variant="summary">
          <PropertyItem
            label={translate('Service Provider')}
            value={view.serviceProvider}
          />
          {view.scheduledStart && (
            <PropertyItem
              label={translate('Scheduled start')}
              value={propVal.date(view.scheduledStart, {
                precision: 'datetime',
              })}
            />
          )}
          {view.scheduledEnd && (
            <PropertyItem
              label={translate('Scheduled end')}
              value={propVal.date(view.scheduledEnd, {
                precision: 'datetime',
              })}
            />
          )}
          <PropertyItem
            label={translate('Message')}
            value={propVal.richText(view.description, { format: 'markdown' })}
          />
        </PropertyList>
      )}

      {!isMaintenance && (
        <PropertyList variant="summary">
          {!hasStructuredContent && (
            <PropertyItem
              label={translate('Message')}
              value={propVal.richText(view.description, { format: 'markdown' })}
            />
          )}
          <PropertyItem
            label={translate('Active from')}
            value={propVal.date(view.activeFrom, { precision: 'datetime' })}
          />
          <PropertyItem
            label={translate('Active to')}
            value={propVal.date(view.activeTo, { precision: 'datetime' })}
          />
        </PropertyList>
      )}

      {renderAffectedOfferings()}
    </ModalDialog>
  );
};

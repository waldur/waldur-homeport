import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { AlertItem, Badge } from 'waldur-ui';

import { BaseButton } from '@/core/buttons/BaseButton';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { ENTRY_TYPE_CONFIG, URGENCY_CONFIG } from './constants';
import { getVersionsBehindLabel } from './labels';
import { ChangelogSummary } from './types';

interface ChangelogSummaryDialogProps {
  resolve: {
    summary: ChangelogSummary;
    currentVersion: string;
    latestVersion: string;
  };
}

export const ChangelogSummaryDialog: FunctionComponent<
  ChangelogSummaryDialogProps
> = ({ resolve: { summary, currentVersion, latestVersion } }) => {
  const router = useRouter();
  const { closeDialog } = useModal();
  const alert = summary.security_alert;
  const urgency = alert
    ? (URGENCY_CONFIG[alert.max_urgency]?.label() ?? alert.max_urgency)
    : null;

  const openChangelog = () => {
    closeDialog();
    router.stateService.go('admin-changelog');
  };

  return (
    <ModalDialog
      title={translate('Upgrade available')}
      closeButton
      footer={
        <>
          <CloseDialogButton label={translate('Dismiss')} />
          <BaseButton
            label={translate('View full changelog')}
            variant="primary"
            onClick={openChangelog}
          />
        </>
      }
    >
      <div className="mb-4">
        <p className="fs-5 mb-1">
          {currentVersion} &rarr; <strong>{latestVersion}</strong>
        </p>
        <p className="text-muted">
          {getVersionsBehindLabel(summary.versions_behind)}
        </p>
      </div>

      {alert && (
        <AlertItem
          variant={alert.max_urgency === 'critical' ? 'error' : 'warning'}
          type="floating"
          className="mb-3"
          title={
            alert.count === 1
              ? translate('1 security fix, {urgency} urgency', { urgency })
              : translate('{count} security fixes, {urgency} urgency', {
                  count: alert.count,
                  urgency,
                })
          }
        />
      )}

      {summary.has_breaking_changes && (
        <div className="d-flex align-items-center gap-2">
          <Badge
            variant={ENTRY_TYPE_CONFIG.breaking.variant}
            shape="pill"
            tone="outline"
          >
            {ENTRY_TYPE_CONFIG.breaking.label()}
          </Badge>
          <span>
            {/* Counted per release from the changelog index, not checked
                against this deployment's plugins or settings. */}
            {summary.breaking_release_count === 1
              ? translate('1 release with breaking changes')
              : translate('{count} releases with breaking changes', {
                  count: summary.breaking_release_count,
                })}
          </span>
        </div>
      )}
    </ModalDialog>
  );
};

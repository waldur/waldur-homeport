import { ArrowCircleUpIcon } from '@phosphor-icons/react';
import { FunctionComponent, useEffect, useState } from 'react';
import { Version, versionRetrieve } from 'waldur-js-client';

import { Tooltip } from 'waldur-ui';

import { getVersionsBehindLabel } from '@/changelog/labels';
import { SecurityAlertBanner } from '@/changelog/SecurityAlertBanner';
import { ChangelogSummary } from '@/changelog/types';
import { ENV } from '@/core/config';
import { format } from '@/core/ErrorMessageFormatter';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useExtraAnnouncementBar } from '@/navigation/context';
import { BackendHealthStatusIndicator } from '@/navigation/footer/BackendHealthStatusIndicator';
import { useNotify } from '@/store/notify';
import { useUser } from '@/workspace/hooks';

import { DisclaimerArea } from './DisclaimerArea';
import { FooterLinks } from './FooterLinks';

const ChangelogSummaryDialog = lazyComponent(() =>
  import('@/changelog/ChangelogSummaryDialog').then((module) => ({
    default: module.ChangelogSummaryDialog,
  })),
);

const UpgradeNotificationDialog = lazyComponent(() =>
  import('./UpgradeNotificationDialog').then((module) => ({
    default: module.UpgradeNotificationDialog,
  })),
);

const isNonReleaseBuild = (buildId: string) =>
  buildId === 'develop' || buildId === 'latest';

// Colour tokens (packages/design-tokens) as text colours; the icon inherits
// them through currentColor.
const getBadgeColorClass = (summary?: ChangelogSummary) => {
  if (
    summary?.security_alert?.max_urgency === 'critical' ||
    summary?.has_breaking_changes
  )
    return 'text-[var(--color-error-600)]';
  if (summary?.security_alert?.max_urgency === 'high')
    return 'text-[var(--color-warning-600)]';
  return 'text-[var(--color-success-600)]';
};

export const AppFooter: FunctionComponent = () => {
  const { showError } = useNotify();

  const { openDialog } = useModal();

  const user = useUser();

  const isUserStaffOrSupport = user?.is_staff || user?.is_support;
  const [versionInfo, setVersionInfo] = useState<Version>(null);

  useEffect(() => {
    const checkVersion = async () => {
      if (isUserStaffOrSupport && !isNonReleaseBuild(ENV.buildId)) {
        try {
          const response = await versionRetrieve();
          setVersionInfo(response.data);
        } catch (error) {
          // API can return html error in case of 404 which is not handled by ErrorMessageFormatter
          if (typeof error === 'string' && error.includes('<!doctype html>')) {
            showError(translate('Version check endpoint is not available.'));
          } else {
            const errorMessage = format(error);
            showError(
              translate('Unable to check version update: {error}', {
                error: errorMessage,
              }),
            );
          }
        }
      }
    };
    checkVersion();
  }, [isUserStaffOrSupport]);

  // The backend serializes changelog_summary as a plain DictField, so the
  // schema (and the SDK) only know it as a free-form object.
  const summary = versionInfo?.changelog_summary as unknown as
    ChangelogSummary | undefined;
  const securityAlert = summary?.security_alert;
  // The changelog summary is computed for the backend's version, which is the
  // one to show and compare against - not the frontend build.
  const backendVersion = versionInfo?.version;

  // Show security banner at top of page via layout context
  useExtraAnnouncementBar(
    securityAlert ? (
      <SecurityAlertBanner
        alert={securityAlert}
        currentVersion={backendVersion}
      />
    ) : null,
    [securityAlert, backendVersion],
  );

  const showUpgradeAvailable =
    versionInfo?.latest_version &&
    backendVersion !== versionInfo.latest_version &&
    !isNonReleaseBuild(ENV.buildId);
  const badgeColorClass = getBadgeColorClass(summary);

  const openUpgradeDialog = () => {
    if (summary) {
      openDialog(ChangelogSummaryDialog, {
        resolve: {
          summary,
          currentVersion: backendVersion,
          latestVersion: versionInfo.latest_version,
        },
      });
    } else {
      openDialog(UpgradeNotificationDialog, {
        resolve: { version: versionInfo.latest_version },
      });
    }
  };

  const badgeLabel = summary
    ? getVersionsBehindLabel(summary.versions_behind)
    : translate('Update available');

  return (
    <div className="footer d-flex flex-column">
      <div className="py-4 d-flex flex-lg-column">
        <div className="container-fluid d-flex flex-column flex-md-row align-items-center justify-content-between fs-6">
          <div className="text-dark fw-bold order-2 order-md-1 icon-align">
            {user && (
              <>
                {translate('Version')}: {ENV.buildId}
              </>
            )}
            <BackendHealthStatusIndicator />
            {showUpgradeAvailable && (
              <Tooltip label={badgeLabel}>
                <ArrowCircleUpIcon
                  size={20}
                  weight="bold"
                  onClick={openUpgradeDialog}
                  className={`ms-8px d-inline-block cursor-pointer ${badgeColorClass}`}
                />
              </Tooltip>
            )}
          </div>
          <FooterLinks />
        </div>
      </div>
      <DisclaimerArea />
    </div>
  );
};

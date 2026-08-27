import { ArrowCircleUpIcon } from '@phosphor-icons/react';
import { FunctionComponent, useEffect, useState } from 'react';
import { versionRetrieve } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { format } from '@/core/ErrorMessageFormatter';
import { lazyComponent } from '@/core/lazyComponent';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { BackendHealthStatusIndicator } from '@/navigation/footer/BackendHealthStatusIndicator';
import { useNotify } from '@/store/notify';
import { useUser } from '@/workspace/hooks';

import { DisclaimerArea } from './DisclaimerArea';
import { FooterLinks } from './FooterLinks';

const UpgradeNotificationDialog = lazyComponent(() =>
  import('./UpgradeNotificationDialog').then((module) => ({
    default: module.UpgradeNotificationDialog,
  })),
);

const compareVersions = (current: string, latest: string) => {
  // Skip comparison for non-semver versions
  if (current === 'develop' || current === 'latest') return false;

  return current !== latest;
};

export const AppFooter: FunctionComponent = () => {
  const { showError } = useNotify();

  const { openDialog } = useModal();

  const user = useUser();

  const isUserStaffOrSupport = user?.is_staff || user?.is_support;
  const [versionInfo, setVersionInfo] = useState<{
    version?: string;
    latest_version?: string;
  }>(null);

  useEffect(() => {
    const checkVersion = async () => {
      if (
        isUserStaffOrSupport &&
        ENV.buildId !== 'develop' &&
        ENV.buildId !== 'latest'
      ) {
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

  const showUpgradeAvailable =
    versionInfo?.latest_version &&
    compareVersions(ENV.buildId, versionInfo.latest_version);

  const openUpgradeDialog = () => {
    openDialog(UpgradeNotificationDialog, {
      resolve: { version: versionInfo.latest_version },
    });
  };

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
              <Tip
                id="upgrade-tooltip"
                label={translate('Update available')}
                className="ms-8px"
              >
                <span className="d-inline-block">
                  <ArrowCircleUpIcon
                    size={20}
                    color="#6B8E23"
                    weight="bold"
                    className="cursor-pointer"
                    onClick={openUpgradeDialog}
                  />
                </span>
              </Tip>
            )}
          </div>
          <FooterLinks />
        </div>
      </div>
      <DisclaimerArea />
    </div>
  );
};

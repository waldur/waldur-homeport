import { ArrowCircleUpIcon } from '@phosphor-icons/react';
import { FunctionComponent, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { versionRetrieve } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { format } from '@waldur/core/ErrorMessageFormatter';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { BackendHealthStatusIndicator } from '@waldur/navigation/BackendHealthStatusIndicator';
import { showError } from '@waldur/store/notify';
import { isStaffOrSupport } from '@waldur/workspace/selectors';

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
  const dispatch = useDispatch();
  const isUserStaffOrSupport = useSelector(isStaffOrSupport);
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
            dispatch(
              showError(translate('Version check endpoint is not available.')),
            );
          } else {
            const errorMessage = format(error);
            dispatch(
              showError(
                translate('Unable to check version update: {error}', {
                  error: errorMessage,
                }),
              ),
            );
          }
        }
      }
    };
    checkVersion();
  }, [isUserStaffOrSupport, dispatch]);

  const showUpgradeAvailable =
    versionInfo?.latest_version &&
    compareVersions(ENV.buildId, versionInfo.latest_version);

  const openUpgradeDialog = () => {
    dispatch(
      openModalDialog(UpgradeNotificationDialog, {
        resolve: { version: versionInfo.latest_version },
      }),
    );
  };

  return (
    <div className="footer py-4 d-flex flex-lg-column">
      <div className="container-fluid d-flex flex-column flex-md-row align-items-center justify-content-between">
        <div className="text-dark order-2 order-md-1">
          <BackendHealthStatusIndicator />
          {translate('Version')}: {ENV.buildId}
          {showUpgradeAvailable && (
            <Tip id="upgrade-tooltip" label={translate('Update available')}>
              <span className="ms-2 d-inline-block">
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
  );
};

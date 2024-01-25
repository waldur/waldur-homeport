import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useMemo } from 'react';

import useScrollTracker from '@waldur/core/useScrollTracker';
import { translate } from '@waldur/i18n';
import { OFFERING_TYPE_CUSTOM_SCRIPTS } from '@waldur/marketplace-script/constants';
import { PageBarTab } from '@waldur/marketplace/common/PageBarTab';
import {
  getPluginOptionsForm,
  getSecretOptionsForm,
  showComponentsList,
  showOfferingOptions,
} from '@waldur/marketplace/common/registry';
import { Offering } from '@waldur/marketplace/types';
import { getServiceSettingsForm } from '@waldur/providers/registry';

import '../details/OfferingPageBar.scss';
import { SCRIPT_ROWS } from './integration/utils';

interface OwnProps {
  offering: Offering;
}

export const OfferingUpdateBar: FunctionComponent<OwnProps> = ({
  offering,
}) => {
  const { state } = useCurrentStateAndParams();

  const ServiceSettingsForm = getServiceSettingsForm(offering.type);
  const SecretOptionsForm = getSecretOptionsForm(offering.type);
  const PluginOptionsForm = getPluginOptionsForm(offering.type);

  const isCustomScript = offering.type === OFFERING_TYPE_CUSTOM_SCRIPTS;

  const showIntegration =
    isCustomScript ||
    Boolean(ServiceSettingsForm) ||
    Boolean(SecretOptionsForm) ||
    Boolean(PluginOptionsForm);

  const isIntegrationError =
    isCustomScript &&
    !SCRIPT_ROWS.every((option) => offering.secret_options[option.type]);

  const tabs = useMemo(() => {
    return [
      { key: 'general', title: translate('General'), visible: true },
      {
        key: 'integration',
        title: (
          <>
            {isCustomScript &&
              (isIntegrationError ? (
                <i className="fa fa-warning text-danger fs-5" />
              ) : (
                <i className="fa fa-check text-success fs-5"></i>
              ))}
            {translate('Integration')}
          </>
        ),
        visible: showIntegration,
      },
      {
        key: 'endpoints',
        title: translate('Endpoints'),
        visible: true,
      },
      {
        key: 'options',
        title: translate('User input'),
        visible: showOfferingOptions(offering.type),
      },
      {
        key: 'resource_options',
        title: translate('Resource options'),
        visible: showOfferingOptions(offering.type),
      },
      { key: 'category', title: translate('Category'), visible: true },
      {
        key: 'components',
        title: (
          <>
            {offering.components.length === 0 ? (
              <i className="fa fa-warning text-danger fs-5" />
            ) : (
              <i className="fa fa-check text-success fs-5"></i>
            )}
            {translate('Accounting components')}
          </>
        ),
        visible: showComponentsList(offering.type),
      },
      {
        key: 'plans',
        title: (
          <>
            {offering.plans.length === 0 ? (
              <i className="fa fa-warning text-danger fs-5" />
            ) : (
              <i className="fa fa-check text-success fs-5"></i>
            )}
            {translate('Accounting plans')}
          </>
        ),
        visible: true,
      },
      { key: 'images', title: translate('Images'), visible: true },
    ].filter((tab) => tab.visible);
  }, [
    isCustomScript,
    isIntegrationError,
    showIntegration,
    showOfferingOptions,
    offering,
    showComponentsList,
  ]);

  const activeSectionId = useScrollTracker({
    sectionIds: tabs.map((tab) => tab.key),
    trackSide: 'bottom',
    offset: 100,
  });

  return (
    <div className="offering-page-bar bg-body shadow-sm">
      <div className="container-xxl">
        <div className="d-flex scroll-x pt-2 pb-1">
          <div className="d-flex align-items-center w-100">
            {tabs.map((tab) => (
              <PageBarTab
                key={tab.key}
                title={tab.title}
                name={tab.key}
                state={state.name}
                params={{ '#': tab.key }}
                active={activeSectionId === tab.key}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { OFFERING_TYPE_CUSTOM_SCRIPTS } from '@waldur/marketplace-script/constants';
import {
  getPluginOptionsForm,
  getSecretOptionsForm,
  showComponentsList,
  showOfferingOptions,
} from '@waldur/marketplace/common/registry';
import { Offering } from '@waldur/marketplace/types';
import { getServiceSettingsForm } from '@waldur/providers/registry';

import { scrollToSectionById } from '../utils';

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

  return (
    <div className="offering-page-bar bg-body shadow-sm">
      <div className="container-xxl">
        <div className="d-flex scroll-x pt-2 pb-1">
          <div className="d-flex align-items-center w-100">
            <Link
              state={state.name}
              params={{ '#': 'general' }}
              className="btn btn-active-color-primary"
              onClick={() => scrollToSectionById('general')}
            >
              {translate('General')}
            </Link>
            {showIntegration && (
              <Link
                state={state.name}
                params={{ '#': 'integration' }}
                className="btn btn-active-color-primary"
                onClick={() => scrollToSectionById('integration')}
              >
                {isCustomScript &&
                  (isIntegrationError ? (
                    <i className="fa fa-warning text-danger fs-5" />
                  ) : (
                    <i className="fa fa-check text-success fs-5"></i>
                  ))}
                {translate('Integration')}
              </Link>
            )}
            {showOfferingOptions(offering.type) && (
              <Link
                state={state.name}
                params={{ '#': 'options' }}
                className="btn btn-active-color-primary"
                onClick={() => scrollToSectionById('options')}
              >
                {translate('User input variables')}
              </Link>
            )}
            <Link
              state={state.name}
              params={{ '#': 'category' }}
              className="btn btn-active-color-primary"
              onClick={() => scrollToSectionById('category')}
            >
              {translate('Category')}
            </Link>
            {showComponentsList(offering.type) && (
              <Link
                state={state.name}
                params={{ '#': 'components' }}
                className="btn btn-active-color-primary"
                onClick={() => scrollToSectionById('components')}
              >
                {offering.components.length === 0 ? (
                  <i className="fa fa-warning text-danger fs-5" />
                ) : (
                  <i className="fa fa-check text-success fs-5"></i>
                )}
                {translate('Accounting components')}
              </Link>
            )}
            <Link
              state={state.name}
              params={{ '#': 'plans' }}
              className="btn btn-active-color-primary"
              onClick={() => scrollToSectionById('plans')}
            >
              {offering.plans.length === 0 ? (
                <i className="fa fa-warning text-danger fs-5" />
              ) : (
                <i className="fa fa-check text-success fs-5"></i>
              )}
              {translate('Accounting plans')}
            </Link>
            <Link
              state={state.name}
              params={{ '#': 'images' }}
              className="btn btn-active-color-primary"
              onClick={() => scrollToSectionById('images')}
            >
              {translate('Images')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

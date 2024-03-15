import { FunctionComponent, useMemo } from 'react';

import { translate } from '@waldur/i18n';
import { OFFERING_TYPE_CUSTOM_SCRIPTS } from '@waldur/marketplace-script/constants';
import { PageBarTabs } from '@waldur/marketplace/common/PageBarTabs';
import { PageBarTab } from '@waldur/marketplace/context';
import { Offering } from '@waldur/marketplace/types';

import { SCRIPT_ROWS } from './integration/utils';

interface OwnProps {
  offering: Offering;
}

export const OfferingUpdateBar: FunctionComponent<OwnProps> = ({
  offering,
}) => {
  const isCustomScript = offering.type === OFFERING_TYPE_CUSTOM_SCRIPTS;

  const isIntegrationError =
    isCustomScript &&
    !SCRIPT_ROWS.every((option) => offering.secret_options[option.type]);

  const tabs = useMemo<PageBarTab[]>(() => {
    return [
      { key: 'general', title: translate('General') },
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
      },
      {
        key: 'endpoints',
        title: translate('Endpoints'),
      },
      {
        key: 'options',
        title: translate('User input'),
      },
      {
        key: 'resource_options',
        title: translate('Resource options'),
      },
      { key: 'category', title: translate('Category') },
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
      },
      { key: 'images', title: translate('Images') },
      { key: 'roles', title: translate('Roles') },
    ];
  }, [isCustomScript, isIntegrationError, offering]);

  return <PageBarTabs tabs={tabs} />;
};

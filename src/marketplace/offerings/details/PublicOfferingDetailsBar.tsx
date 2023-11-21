import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useMemo } from 'react';

import { Link } from '@waldur/core/Link';
import { Tip } from '@waldur/core/Tooltip';
import useScrollTracker from '@waldur/core/useScrollTracker';
import { translate } from '@waldur/i18n';
import { PageBarTab } from '@waldur/marketplace/common/PageBarTab';
import { Offering } from '@waldur/marketplace/types';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';

import './OfferingPageBar.scss';

interface OwnProps {
  offering: Offering;
  canDeploy?: boolean;
}

export const PublicOfferingDetailsBar: FunctionComponent<OwnProps> = ({
  offering,
  canDeploy,
}) => {
  const { state } = useCurrentStateAndParams();
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();

  const tabs = useMemo(() => {
    return [
      { key: 'general', title: translate('General'), visible: true },
      { key: 'description', title: translate('Description'), visible: true },
      { key: 'components', title: translate('Components'), visible: true },
      {
        key: 'images',
        title: translate('Images'),
        visible: showExperimentalUiComponents,
      },
      {
        key: 'getting-started',
        title: translate('Getting started'),
        visible: showExperimentalUiComponents,
      },
      {
        key: 'faq',
        title: translate('FAQ'),
        visible: showExperimentalUiComponents,
      },
      {
        key: 'reviews',
        title: translate('Reviews'),
        visible: showExperimentalUiComponents,
      },
      { key: 'pricing', title: translate('Pricing'), visible: true },
    ].filter((tab) => tab.visible);
  }, []);

  const activeSectionId = useScrollTracker({
    sectionIds: tabs.map((tab) => tab.key),
    trackSide: 'bottom',
    offset: 100,
  });

  return (
    <div className="offering-page-bar bg-body shadow-sm">
      <div className="container-xxl">
        <div className="d-flex scroll-x pt-2 pb-1">
          <div className="d-flex align-items-stretch justify-content-between w-100">
            <div className="d-flex align-items-center">
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
            <Tip
              id="tip-deploy"
              label={
                offering.state === 'Paused' ? offering.paused_reason : null
              }
              placement="left"
            >
              <Link
                state={canDeploy ? 'marketplace-offering-user' : ''}
                params={{ offering_uuid: offering.uuid }}
                className={`btn btn-primary ${canDeploy ? '' : 'disabled'}`}
              >
                {translate('Deploy')}
              </Link>
            </Tip>
          </div>
        </div>
      </div>
    </div>
  );
};

PublicOfferingDetailsBar.defaultProps = {
  canDeploy: true,
};

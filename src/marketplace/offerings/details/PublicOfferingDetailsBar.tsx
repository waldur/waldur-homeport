import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';

import { scrollToSectionById } from '../utils';

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

  return (
    <div className="offering-page-bar bg-body shadow-sm">
      <div className="container-xxl">
        <div className="d-flex scroll-x pt-2 pb-1">
          <div className="d-flex align-items-stretch justify-content-between w-100">
            <div className="d-flex align-items-center">
              <Link
                state={state.name}
                params={{ '#': 'general' }}
                className="btn btn-active-color-primary"
                onClick={() => scrollToSectionById('general')}
              >
                {translate('General')}
              </Link>
              <Link
                state={state.name}
                params={{ '#': 'description' }}
                className="btn btn-active-color-primary"
                onClick={() => scrollToSectionById('description')}
              >
                {translate('Description')}
              </Link>
              <Link
                state={state.name}
                params={{ '#': 'components' }}
                className="btn btn-active-color-primary"
                onClick={() => scrollToSectionById('components')}
              >
                {translate('Components')}
              </Link>
              {showExperimentalUiComponents && (
                <Link
                  state={state.name}
                  params={{ '#': 'images' }}
                  className="btn btn-active-color-primary"
                  onClick={() => scrollToSectionById('images')}
                >
                  {translate('Images')}
                </Link>
              )}
              {showExperimentalUiComponents && (
                <Link
                  state={state.name}
                  params={{ '#': 'getting-started' }}
                  className="btn btn-active-color-primary"
                  onClick={() => scrollToSectionById('getting-started')}
                >
                  {translate('Getting started')}
                </Link>
              )}
              {showExperimentalUiComponents && (
                <Link
                  state={state.name}
                  params={{ '#': 'faq' }}
                  className="btn btn-active-color-primary"
                  onClick={() => scrollToSectionById('faq')}
                >
                  {translate('FAQ')}
                </Link>
              )}
              {showExperimentalUiComponents && (
                <Link
                  state={state.name}
                  params={{ '#': 'reviews' }}
                  className="btn btn-active-color-primary"
                  onClick={() => scrollToSectionById('reviews')}
                >
                  {translate('Reviews')}
                </Link>
              )}
              <Link
                state={state.name}
                params={{ '#': 'pricing' }}
                className="btn btn-active-color-primary"
                onClick={() => scrollToSectionById('pricing')}
              >
                {translate('Pricing')}
              </Link>
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

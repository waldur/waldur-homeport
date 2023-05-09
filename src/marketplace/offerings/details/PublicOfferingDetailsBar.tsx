import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';

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

  const goSection = (section: string) => {
    const el = document.getElementById(section);
    window.scroll({
      behavior: 'smooth',
      left: 0,
      top: el.offsetTop - 180,
    });
  };

  return (
    <div className="public-offering-page-bar bg-body shadow-sm">
      <div className="container-xxl">
        <div className="d-flex scroll-x pt-2 pb-1">
          <div className="d-flex align-items-stretch justify-content-between w-100">
            <div className="d-flex align-items-center">
              <Link
                state={state.name}
                params={{ '#': 'general' }}
                className="btn btn-active-color-primary"
                onClick={() => goSection('general')}
              >
                {translate('General')}
              </Link>
              <Link
                state={state.name}
                params={{ '#': 'description' }}
                className="btn btn-active-color-primary"
                onClick={() => goSection('description')}
              >
                {translate('Description')}
              </Link>
              <Link
                state={state.name}
                params={{ '#': 'components' }}
                className="btn btn-active-color-primary"
                onClick={() => goSection('components')}
              >
                {translate('Components')}
              </Link>
              {showExperimentalUiComponents && (
                <Link
                  state={state.name}
                  params={{ '#': 'images' }}
                  className="btn btn-active-color-primary"
                  onClick={() => goSection('images')}
                >
                  {translate('Images')}
                </Link>
              )}
              {showExperimentalUiComponents && (
                <Link
                  state={state.name}
                  params={{ '#': 'getting-started' }}
                  className="btn btn-active-color-primary"
                  onClick={() => goSection('getting-started')}
                >
                  {translate('Getting started')}
                </Link>
              )}
              {showExperimentalUiComponents && (
                <Link
                  state={state.name}
                  params={{ '#': 'faq' }}
                  className="btn btn-active-color-primary"
                  onClick={() => goSection('faq')}
                >
                  {translate('FAQ')}
                </Link>
              )}
              {showExperimentalUiComponents && (
                <Link
                  state={state.name}
                  params={{ '#': 'reviews' }}
                  className="btn btn-active-color-primary"
                  onClick={() => goSection('reviews')}
                >
                  {translate('Reviews')}
                </Link>
              )}
              <Link
                state={state.name}
                params={{ '#': 'pricing' }}
                className="btn btn-active-color-primary"
                onClick={() => goSection('pricing')}
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

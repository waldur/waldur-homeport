import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

import { scrollToSectionById } from '../utils';

import './OfferingPageBar.scss';

export const OfferingDetailsBar: FunctionComponent = () => {
  const { state } = useCurrentStateAndParams();

  return (
    <div className="offering-page-bar bg-light-dark shadow-sm">
      <div className="container-xxl">
        <div className="d-flex scroll-x pt-2 pb-1">
          <div className="d-flex align-items-center w-100">
            <Link
              state={state.name}
              params={{ '#': 'order-items' }}
              className="btn text-white"
              onClick={() => scrollToSectionById('order-items')}
            >
              {translate('Order items')}
            </Link>
            <Link
              state={state.name}
              params={{ '#': 'resources' }}
              className="btn text-white"
              onClick={() => scrollToSectionById('resources')}
            >
              {translate('Resources')}
            </Link>
            <Link
              state={state.name}
              params={{ '#': 'users' }}
              className="btn text-white"
              onClick={() => scrollToSectionById('users')}
            >
              {translate('Users')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

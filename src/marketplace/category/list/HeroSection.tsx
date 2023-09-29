import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

interface HeroSectionProps {
  title: string;
}

export const HeroSection: FunctionComponent<HeroSectionProps> = (props) => {
  const { params, state } = useCurrentStateAndParams();
  return (
    <>
      <div className="all-categories__background"></div>
      <div className="all-categories__table container-xxl">
        <div className="all-categories__cell">
          {params?.group && (
            <div className="all-categories__main mb-6">
              <Link
                state={state.name}
                params={{ group: undefined }}
                className="text-link text-white"
              >
                {translate('Go back')}
              </Link>
            </div>
          )}
          <div className="all-categories__main">
            <h1>{props.title}</h1>
          </div>
        </div>
      </div>
    </>
  );
};

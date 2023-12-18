import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useContext, useEffect } from 'react';

import { translate } from '@waldur/i18n';
import { PageBarTab } from '@waldur/marketplace/common/PageBarTab';
import { PageBarContext } from '@waldur/marketplace/context';

import './CallPageBar.scss';

export const PublicCallDetailsBar: FunctionComponent = () => {
  const { state } = useCurrentStateAndParams();
  const { tabs, addTabs, visibleSectionId } = useContext(PageBarContext);

  useEffect(() => {
    addTabs([
      {
        key: 'details',
        title: translate('Details'),
      },
      {
        key: 'description',
        title: translate('Description'),
      },
      {
        key: 'documents',
        title: translate('Documents'),
      },
      {
        key: 'offerings',
        title: translate('Offerings'),
      },
    ]);
  }, []);

  return (
    <div className="call-page-bar bg-body shadow-sm">
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
                active={visibleSectionId === tab.key}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

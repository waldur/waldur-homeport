import { useCurrentStateAndParams } from '@uirouter/react';
import { FC, ReactNode, useContext, useEffect } from 'react';

import { Link } from '@waldur/core/Link';

import { PageBarContext, PageBarTab } from '../context';
import { scrollToSectionById } from '../offerings/utils';

import './PageBarTabs.scss';

interface PageBarTabProps {
  title: any;
  name: string;
  state: string;
  params?: any;
  active?: boolean;
  className?: string;
}

export const PageBarTabItem = (props: PageBarTabProps) => (
  <Link
    state={props.state}
    params={props.params}
    className={
      props.className ||
      'btn btn-sm text-hover-primary' + (props.active ? ' text-primary' : '')
    }
    onClick={() => scrollToSectionById(props.name)}
  >
    {props.title}
  </Link>
);

interface PageBarTabsProps {
  tabs: PageBarTab[];
  right?: ReactNode;
}

export const PageBarTabs: FC<PageBarTabsProps> = (props) => {
  const { tabs, addTabs, visibleSectionId } = useContext(PageBarContext);
  const { state } = useCurrentStateAndParams();

  useEffect(() => {
    addTabs(props.tabs);
  }, [props.tabs]);

  return (
    <div className="page-bar-container bg-body shadow-sm">
      <div className="container-xxl">
        <div className="d-flex scroll-x pt-2">
          <div className="d-flex align-items-center w-100">
            {tabs.map((tab) => (
              <PageBarTabItem
                key={tab.key}
                title={tab.title}
                name={tab.key}
                state={tab.state ?? state.name}
                params={tab.params ?? { '#': tab.key }}
                active={visibleSectionId === tab.key}
              />
            ))}
            {props.right && <div className="ms-auto">{props.right}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

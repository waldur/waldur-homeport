import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FC, ReactNode, useContext, useEffect } from 'react';
import { Button, Nav, TabContainer } from 'react-bootstrap';

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
  subTabs?: Omit<PageBarTabProps, 'children'>[];
}

export const PageBarTabItem = (props: PageBarTabProps) =>
  props.subTabs?.length > 0 ? (
    <div>
      <Button
        variant="active-secondary"
        size="sm"
        data-kt-menu-trigger="hover"
        data-kt-menu-placement="bottom-start"
        data-kt-menu-attach="parent"
        className={
          props.className ||
          'bg-hover-secondary text-active-inverse-secondary btn-no-focus' +
            (props.active || props.subTabs.some((child) => child.active)
              ? ' active'
              : '')
        }
        onClick={() => scrollToSectionById(props.name)}
      >
        {props.title}
      </Button>

      <div
        className="menu menu-sub menu-sub-dropdown menu-column menu-gray-800 menu-state-bg-light fw-bold w-auto min-w-150px mw-300px py-2"
        data-kt-menu="true"
      >
        {props.subTabs.map((childTab, childIndex) => (
          <div className="showing" key={childIndex}>
            <Link
              state={childTab.state}
              params={childTab.params}
              className="menu-item"
              data-kt-menu-trigger="click"
              onClick={() => scrollToSectionById(childTab.name)}
            >
              <span className="menu-link">
                <span className="menu-title">{childTab.title}</span>
              </span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <Link
      state={props.state}
      params={props.params}
      className={
        props.className ||
        'btn btn-sm bg-active-secondary bg-hover-secondary text-active-inverse-secondary btn-no-focus' +
          (props.active ? ' active' : '')
      }
      onClick={() => scrollToSectionById(props.name)}
    >
      {props.title}
    </Link>
  );

interface PageBarTabsProps {
  tabs: PageBarTab[];
  right?: ReactNode;
  showFirstTab?: boolean;
  mode?: 'bar' | 'tabs-left';
}

export const PageBarTabs: FC<PageBarTabsProps> = (props) => {
  const { tabs, addTabs, visibleSectionId } = useContext(PageBarContext);
  const { state, params } = useCurrentStateAndParams();
  const router = useRouter();

  useEffect(() => {
    addTabs(props.tabs);
  }, [props.tabs]);

  useEffect(() => {
    if (props.showFirstTab && !params['#'] && tabs.length > 0) {
      router.stateService.go(state, { '#': tabs[0].key });
    }
  }, [props.showFirstTab, tabs, params, state, router]);

  if (!tabs.length) return;

  return (props.mode ?? 'bar') === 'bar' ? (
    <div className="page-bar-container bg-body shadow-sm">
      <div className="container-fluid">
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
                subTabs={
                  tab.children?.length > 0
                    ? tab.children.map((child) => ({
                        key: child.key,
                        title: child.title,
                        name: child.key,
                        state: child.state ?? state.name,
                        params: child.params ?? { '#': child.key },
                        active: visibleSectionId === child.key,
                      }))
                    : undefined
                }
              />
            ))}
            {props.right && <div className="ms-auto">{props.right}</div>}
          </div>
        </div>
      </div>
    </div>
  ) : props.mode === 'tabs-left' ? (
    <TabContainer
      defaultActiveKey={tabs[0].key}
      activeKey={visibleSectionId}
      onSelect={(key) => scrollToSectionById(key)}
    >
      <Nav variant="tabs" className="page-tabs-container nav-line-tabs">
        {tabs.map((tab) => (
          <Nav.Item key={tab.key}>
            <Nav.Link
              eventKey={tab.key}
              as={Link}
              state={tab.state ?? state.name}
              params={tab.params ?? { '#': tab.key }}
            >
              {tab.title}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>
    </TabContainer>
  ) : null;
};

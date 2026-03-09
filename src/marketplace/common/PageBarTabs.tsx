import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import classNames from 'classnames';
import { debounce, throttle } from 'lodash-es';
import {
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
// eslint-disable-next-line waldur-custom/no-direct-bootstrap-button -- Navigation button with Metronic menu data attributes
import { Button, Nav, TabContainer } from 'react-bootstrap';

import { Link } from '@waldur/core/Link';
import { useDOMChangeObserver } from '@waldur/core/useDomChangeObserver';

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

const PageBarTabItem = (props: PageBarTabProps) =>
  props.subTabs?.length > 0 ? (
    <div>
      <Button
        variant="text-primary"
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
        data-testid={`page-bar-tab-${props.name}`}
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
      data-testid={`page-bar-tab-${props.name}`}
    >
      {props.title}
    </Link>
  );

interface PageBarTabsProps {
  tabs: PageBarTab[];
  right?: ReactNode;
  showFirstTab?: boolean;
  mode?: 'bar' | 'tabs-left';
  className?: string;
}

export const PageBarTabs: FC<PageBarTabsProps> = (props) => {
  const { tabs, addTabs, visibleSectionId } = useContext(PageBarContext);
  const { state, params } = useCurrentStateAndParams();
  const router = useRouter();

  useDOMChangeObserver(() => {
    addTabs(props.tabs);
  }, [props.tabs]);

  useEffect(() => {
    if (props.showFirstTab && !params['#'] && tabs.length > 0) {
      router.stateService.go(state, { '#': tabs[0].key });
    }
  }, [props.showFirstTab, tabs, params, state, router]);

  // When a tab is clicked, we need to keep it active until the user scrolls for a while
  // or clicks another tab. This is to prevent the tab from being unselected when the user
  // scrolls to other sections.
  const [clickedTabId, setClickedTabId] = useState<string | null>(null);

  const releaseClickedTabFlag = useRef<boolean>(true);
  const releaseClickedTab = debounce(() => {
    releaseClickedTabFlag.current = true;
  }, 1000);

  const selectTab = useCallback((key) => {
    releaseClickedTabFlag.current = false;
    setClickedTabId(key);
    scrollToSectionById(key);
    releaseClickedTab();
  }, []);

  const clearClickedTabId = useCallback(
    throttle(() => {
      if (releaseClickedTabFlag.current) {
        setClickedTabId(null);
      }
    }, 100),
    [setClickedTabId, releaseClickedTabFlag.current],
  );

  useEffect(() => {
    window.addEventListener('scroll', clearClickedTabId);
    return () => {
      window.removeEventListener('scroll', clearClickedTabId);
    };
  }, [clearClickedTabId]);

  if (!tabs.length) return;

  return (props.mode ?? 'bar') === 'bar' ? (
    <div
      className={classNames(
        'page-bar-container bg-body shadow-sm',
        props.className,
      )}
    >
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
      activeKey={clickedTabId || visibleSectionId}
      onSelect={(key) => selectTab(key)}
    >
      <Nav
        variant="tabs"
        className={classNames(
          'page-tabs-container nav-line-tabs',
          props.className,
        )}
      >
        {tabs.map((tab) => (
          <Nav.Item key={tab.key}>
            <Nav.Link
              eventKey={tab.key}
              as={Link}
              state={tab.state ?? state.name}
              params={tab.params ?? { '#': tab.key }}
              className="flex-grow-1"
            >
              {props.tabs.find((t) => t.key === tab.key).title}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>
    </TabContainer>
  ) : null;
};

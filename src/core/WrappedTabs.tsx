import { DotsThreeVerticalIcon } from '@phosphor-icons/react';
import { debounce } from 'lodash-es';
import React from 'react';
import { Dropdown, Nav, Tab } from 'react-bootstrap';

interface WrappedTabsProps<T extends { uuid? } = any> {
  defaultActiveKey;
  items: T[];
  wrappedItems: T[];
  renderTab: React.ComponentType<{ item: T }>;
  renderContent: React.ComponentType<{ item: T }>;
  toggleContent?: React.ReactNode;
}

const WrappedTabs = React.forwardRef(
  <T extends { uuid? }>(
    props: WrappedTabsProps<T>,
    ref: React.Ref<HTMLDivElement>,
  ) => {
    return (
      <Tab.Container defaultActiveKey={props.defaultActiveKey}>
        <div className="d-flex">
          <Nav
            ref={ref}
            variant="tabs"
            className="nav-line-tabs flex-grow-1 mb-4"
          >
            {props.items.map((item) => {
              const isHidden = props.wrappedItems.some(
                (c) => item.uuid === c.uuid,
              );
              return (
                <Nav.Item key={item.uuid} className={isHidden && 'h-0'}>
                  <Nav.Link eventKey={item.uuid}>
                    {isHidden ? (
                      <div className="w-10px" />
                    ) : (
                      React.createElement(props.renderTab, { item })
                    )}
                  </Nav.Link>
                </Nav.Item>
              );
            })}
          </Nav>
          {props.wrappedItems.length > 0 ? (
            <Nav variant="tabs" className="nav-line-tabs mb-4">
              <Nav.Item>
                <Dropdown>
                  <Dropdown.Toggle
                    variant="active-light-primary"
                    className="btn-icon btn-text-grey-500 no-arrow w-35px h-35px"
                  >
                    <DotsThreeVerticalIcon size={22} weight="bold" />
                    {props.toggleContent}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <div className="mh-200px overflow-auto">
                      {props.wrappedItems.map((item) => (
                        <Dropdown.Item
                          key={item.uuid}
                          eventKey={item.uuid}
                          className="d-flex justify-content-between"
                        >
                          {React.createElement(props.renderTab, { item })}
                        </Dropdown.Item>
                      ))}
                    </div>
                  </Dropdown.Menu>
                </Dropdown>
              </Nav.Item>
            </Nav>
          ) : (
            <div className="w-35px" />
          )}
        </div>
        <Tab.Content>
          {props.items.map((item) => (
            <Tab.Pane key={item.uuid} eventKey={item.uuid}>
              {React.createElement(props.renderContent, { item })}
            </Tab.Pane>
          ))}
        </Tab.Content>
      </Tab.Container>
    );
  },
) as <T extends { uuid? }>(
  props: WrappedTabsProps<T> & { ref: React.Ref<HTMLDivElement> },
) => React.ReactElement;

export const useWrappedTabs = <T extends { uuid? }>(items) => {
  const refNav = React.useRef(null);
  const [wrappedItems, setWrappedItems] = React.useState<T[]>([]);

  const handleWindowResize = React.useCallback(
    debounce(() => {
      if (!refNav?.current) return;
      const tabs = Array.from<HTMLElement>(refNav.current.children);
      const wrappedItems = [];
      if (!tabs?.length) return;
      const firstTab = tabs[0].getBoundingClientRect();
      for (let i = 0; i < tabs.length; i++) {
        const currItem = tabs[i].getBoundingClientRect();
        if (firstTab && firstTab.top < currItem.top) {
          if (items[i]) {
            wrappedItems.push(items[i]);
          }
        }
      }
      setWrappedItems(wrappedItems);
    }, 100),
    [refNav?.current, items],
  );

  React.useEffect(() => {
    window.addEventListener('resize', handleWindowResize);
    handleWindowResize();
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [handleWindowResize]);

  return {
    WrappedTabs: WrappedTabs<T>,
    refNav,
    handleWindowResize,
    wrappedItems,
  };
};

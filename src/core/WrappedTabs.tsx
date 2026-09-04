import { DotsThreeVerticalIcon } from '@phosphor-icons/react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import SelectableContext from '@restart/ui/SelectableContext';
import { debounce } from 'lodash-es';
import React from 'react';
import { Nav, Tab } from 'react-bootstrap';

import { ActionsDropdownItem } from '@/table/ActionsDropdown';

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
    // Tab.Container below is uncontrolled (defaultActiveKey only), so
    // switching tabs from this overflow dropdown has to go through the same
    // internal SelectableContext that Nav.Link's own eventKey taps into.
    const selectTab = React.useContext(SelectableContext);
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
                <RadixDropdownMenu.Root>
                  <RadixDropdownMenu.Trigger asChild>
                    <button
                      type="button"
                      className="btn dropdown-toggle btn-text-secondary btn-icon no-arrow w-35px h-35px"
                    >
                      <DotsThreeVerticalIcon size={22} weight="bold" />
                      {props.toggleContent}
                    </button>
                  </RadixDropdownMenu.Trigger>
                  <RadixDropdownMenu.Portal>
                    <RadixDropdownMenu.Content
                      sideOffset={2}
                      className="dropdown-menu show position-static"
                    >
                      <div className="mh-200px overflow-auto">
                        {props.wrappedItems.map((item) => (
                          <ActionsDropdownItem
                            key={item.uuid}
                            className="d-flex justify-content-between"
                            onClick={(event) => selectTab?.(item.uuid, event)}
                          >
                            {React.createElement(props.renderTab, { item })}
                          </ActionsDropdownItem>
                        ))}
                      </div>
                    </RadixDropdownMenu.Content>
                  </RadixDropdownMenu.Portal>
                </RadixDropdownMenu.Root>
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

import classNames from 'classnames';
import { FC, Fragment, ReactNode, useState } from 'react';

import {
  resolveTabValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from 'waldur-ui';

import { TableProps } from './types';

export type BaseTableWithTabsProps = Pick<
  TableProps,
  'title' | 'subtitle' | 'tabs' | 'className' | 'headerClassName'
> & {
  data?: Record<string, any>;
  actions?: ReactNode | Array<{ activeKeys: string[]; component: ReactNode }>;
  headerActions?: ReactNode;
  /** The open tab, when the caller keeps it (e.g. in the URL); without it the
   * component keeps it itself, starting from the first tab. */
  activeKey?: string;
  onSelect?: (key: string) => void;
};

export const BaseTableWithTabs: FC<BaseTableWithTabsProps> = ({
  title,
  subtitle,
  tabs,
  className,
  headerClassName,
  data = {},
  actions,
  headerActions,
  activeKey: controlledKey,
  onSelect,
}) => {
  const [localKey, setLocalKey] = useState<string>();
  const activeKey = resolveTabValue(
    tabs.map((tab) => tab.key),
    controlledKey ?? localKey,
  );
  const handleSelect = onSelect ?? setLocalKey;

  // The open tab's table portals its toolbar and refresh button into these
  // header slots. Callback refs re-render once both exist, so the panels mount
  // with real targets. Only the open panel is mounted (mount="active"), so a
  // tab switch unmounts the old table and its portalled controls with it.
  const [titleNode, setTitleNode] = useState<HTMLDivElement | null>(null);
  const [toolbarNode, setToolbarNode] = useState<HTMLDivElement | null>(null);

  return (
    <div className={classNames('card-table card-bordered', className, 'card')}>
      <div className={classNames(headerClassName, 'card-header')}>
        <div className="card-toolbar g-0 gap-3 w-full row">
          <div className="col">
            <div ref={setTitleNode} className="card-title h5">
              <div className="me-1.5">
                <h3>{title}</h3>
                {Boolean(subtitle) && (
                  <small className="text-sm font-normal block mt-1.5">
                    {subtitle}
                  </small>
                )}
              </div>
            </div>
            {/* Portal destination */}
          </div>
          <div className="ms-auto max-w-full flex gap-3 max-sm:flex-wrap text-nowrap col-sm-auto">
            {headerActions}
            <div
              ref={setToolbarNode}
              className="flex sm:justify-end max-sm:flex-wrap text-nowrap gap-3"
            >
              {/* Portal destination */}
            </div>
          </div>
        </div>
      </div>
      <div className="pt-2.5 card-body">
        <Tabs
          value={activeKey}
          onValueChange={handleSelect}
          mount="active"
          className="min-h-[175px]"
        >
          <div className="flex justify-between">
            <TabsList scrollable scrollClassName="grow">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.key} value={tab.key}>
                  {tab.title}
                </TabsTrigger>
              ))}
            </TabsList>
            {actions ? (
              Array.isArray(actions) && actions.length ? (
                <div className="flex items-center border-b-[1px] border-b-secondary gap-1.5">
                  {actions.map((action, index) => (
                    <Fragment key={index}>
                      {action.activeKeys.includes(activeKey)
                        ? action.component
                        : null}
                    </Fragment>
                  ))}
                </div>
              ) : (
                <div className="border-b-[1px] border-b-secondary">
                  {actions as ReactNode}
                </div>
              )
            ) : null}
          </div>
          {titleNode && toolbarNode && (
            <div className="overflow-auto">
              {tabs.map((tab) => (
                <TabsContent key={tab.key} value={tab.key}>
                  <tab.component
                    {...data}
                    activeTab={activeKey}
                    portal={{ toolbar: toolbarNode, refresh: titleNode }}
                  />
                </TabsContent>
              ))}
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );
};

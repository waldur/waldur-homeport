import { FunctionComponent } from 'react';
import { Tab, Tabs } from 'react-bootstrap';

import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';

export const NotificationExpandableRow: FunctionComponent<{
  row;
}> = ({ row }) => (
  <div className="tabs-container">
    <Tabs
      defaultActiveKey="tab-0"
      id="notification-templates-tabs"
      unmountOnExit
      mountOnEnter
    >
      {row.templates.map((component, index: number) => (
        <Tab
          title={<>{component.path}</>}
          key={index}
          eventKey={`tab-${index}`}
        >
          <div className="mt-5">
            <div className="row">
              <div className="col-md-9">
                <pre>{component.content}</pre>
              </div>
              <div className="col-md-3 d-flex align-items-center justify-content-end">
                <CopyToClipboardButton
                  className="mx-2 text-hover-primary cursor-pointer d-inline z-index-1"
                  value={component.content}
                  size="2x"
                />
              </div>
            </div>
          </div>
        </Tab>
      ))}
    </Tabs>
  </div>
);

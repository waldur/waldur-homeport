import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Tab, Tabs } from 'react-bootstrap';

import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

export const NotificationExpandableRow: FunctionComponent<{
  row;
}> = ({ row }) => {
  return (
    <ExpandableContainer>
      <div className="tabs-container">
        <Tabs
          defaultActiveKey="tab-0"
          id="notification-templates-tabs"
          unmountOnExit
          mountOnEnter
        >
          {row.templates.map((template, index: number) => (
            <Tab
              title={
                <>
                  {template.is_content_overridden ? (
                    <div>
                      {template.path}
                      <span className="svg-icon svg-icon-5 ms-3">
                        <PencilSimpleIcon />
                      </span>
                    </div>
                  ) : (
                    template.path
                  )}
                </>
              }
              key={index}
              eventKey={`tab-${index}`}
            >
              <div className="mt-5 mx-5">
                <div className="row">
                  <div className="col-md-9">
                    <pre>{template.content}</pre>
                  </div>
                  <div className="col-md-3 d-flex align-items-start justify-content-end">
                    <CopyToClipboardButton
                      className="mx-2 text-hover-primary cursor-pointer d-inline z-index-1"
                      value={template.content}
                      size={30}
                    />
                  </div>
                </div>
              </div>
            </Tab>
          ))}
        </Tabs>
      </div>
    </ExpandableContainer>
  );
};

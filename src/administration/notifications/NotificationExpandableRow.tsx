import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Card, Tab, Tabs } from 'react-bootstrap';

import { CopyToClipboard } from '@/core/CopyToClipboard';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { formatHeader } from './NotificationForm';

export const NotificationExpandableRow: FunctionComponent<{
  row;
}> = ({ row }) => {
  return (
    <ExpandableContainer>
      <div className="tabs-container tabs-scrollable">
        <Tabs
          defaultActiveKey="tab-0"
          id="notification-templates-tabs"
          className="nav-line-tabs"
          unmountOnExit
          mountOnEnter
        >
          {row.templates.map((template, index: number) => (
            <Tab
              title={
                <>
                  {template.is_content_overridden ? (
                    <div>
                      {formatHeader(template.path)}
                      <Tip
                        id={'tip-notif-overridden-' + index}
                        label={translate('Content is overridden')}
                        className="svg-icon svg-icon-5 ms-3"
                      >
                        <PencilSimpleIcon weight="bold" />
                      </Tip>
                    </div>
                  ) : (
                    formatHeader(template.path)
                  )}
                </>
              }
              key={index}
              eventKey={`tab-${index}`}
            >
              <Card className="card-bordered card-solid">
                <Card.Header className="min-h-auto">
                  <h6 className="mb-0 fw-bold">
                    {translate('Notification template')}
                  </h6>
                  <CopyToClipboard
                    label={translate('Copy')}
                    value={template.content}
                    textButton
                    rightIcon
                    className="my-2 text-hover-primary"
                  />
                </Card.Header>
                <Card.Body className="p-8">
                  <pre className="text-gray-700 fs-6 mb-0">
                    {template.content}
                  </pre>
                </Card.Body>
              </Card>
            </Tab>
          ))}
        </Tabs>
      </div>
    </ExpandableContainer>
  );
};

import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { Tooltip } from 'waldur-ui';

import { CopyToClipboard } from '@/core/CopyToClipboard';
import { translate } from '@/i18n';
import { EmbeddedTabs } from '@/table/EmbeddedTabs';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { formatHeader } from './NotificationForm';

import './NotificationExpandableRow.scss';

export const NotificationExpandableRow: FunctionComponent<{
  row;
}> = ({ row }) => {
  return (
    <ExpandableContainer>
      <div className="notification-templates-tabs">
        <EmbeddedTabs
          defaultValue={row.templates[0]?.path}
          tabs={row.templates.map((template) => ({
            key: template.path,
            title: template.is_content_overridden ? (
              <span className="inline-flex items-center">
                {formatHeader(template.path)}
                <Tooltip label={translate('Content is overridden')}>
                  <PencilSimpleIcon
                    weight="bold"
                    className="svg-icon svg-icon-5 ms-3"
                  />
                </Tooltip>
              </span>
            ) : (
              formatHeader(template.path)
            ),
            content: (
              <Card className="card-bordered card-solid">
                <Card.Header className="min-h-auto">
                  <h6 className="mb-0 font-medium">
                    {translate('Notification template')}
                  </h6>
                  <CopyToClipboard
                    label={translate('Copy')}
                    value={template.content}
                    textButton
                    rightIcon
                    className="my-2 hover:text-brand"
                  />
                </Card.Header>
                <Card.Body className="p-8">
                  <pre className="text-secondary text-sm mb-0">
                    {template.content}
                  </pre>
                </Card.Body>
              </Card>
            ),
          }))}
        />
      </div>
    </ExpandableContainer>
  );
};

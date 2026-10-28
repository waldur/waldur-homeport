import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

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
                    size={16}
                    weight="bold"
                    className="ms-2.5 text-quaternary"
                  />
                </Tooltip>
              </span>
            ) : (
              formatHeader(template.path)
            ),
            content: (
              <div className="card card-bordered card-solid">
                <div className="card-header min-h-auto">
                  <h6 className="mb-0 font-medium">
                    {translate('Notification template')}
                  </h6>
                  <CopyToClipboard
                    label={translate('Copy')}
                    value={template.content}
                    textButton
                    rightIcon
                    className="my-1.5 hover:text-brand"
                  />
                </div>
                <div className="card-body p-6">
                  <pre className="text-secondary text-sm mb-0">
                    {template.content}
                  </pre>
                </div>
              </div>
            ),
          }))}
        />
      </div>
    </ExpandableContainer>
  );
};

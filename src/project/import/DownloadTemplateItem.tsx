import { DownloadSimpleIcon, FileCsvIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { BaseButton } from 'waldur-ui';

import { AttachmentCard } from '@/form/upload/AttachmentCard';
import { translate } from '@/i18n';

interface DownloadTemplateItemProps {
  name: string;
  size?: string;
  onClick(e?): void;
}

export const DownloadTemplateItem: FC<DownloadTemplateItemProps> = (props) => {
  return (
    <AttachmentCard
      className="mb-5"
      thumb={
        <FileCsvIcon size={20} weight="bold" className="text-quaternary" />
      }
      title={
        <button
          type="button"
          className="font-medium text-secondary text-anchor"
          onClick={props.onClick}
        >
          {props.name}.csv
        </button>
      }
      subtitle={props.size}
      actions={
        <BaseButton
          tooltip={translate('Download')}
          onClick={props.onClick}
          iconNode={<DownloadSimpleIcon weight="bold" />}
          iconRight
          variant="text-primary"
          size="sm"
        />
      }
    />
  );
};

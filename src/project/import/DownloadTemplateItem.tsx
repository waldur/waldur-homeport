import { DownloadSimpleIcon, FileCsvIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { BaseButton, LinkButton } from 'waldur-ui';

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
        <LinkButton
          className="font-medium text-secondary hover:text-[var(--text-brand-secondary)]"
          onClick={props.onClick}
        >
          {props.name}.csv
        </LinkButton>
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

import { DownloadSimpleIcon, FileCsvIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { BaseButton } from 'waldur-ui';

interface DownloadTemplateItemProps {
  name: string;
  size?: string;
  onClick(e?): void;
}

export const DownloadTemplateItem: FC<DownloadTemplateItemProps> = (props) => {
  return (
    <div className="attachment-item mb-6">
      <div className="attachment-item__thumb">
        <FileCsvIcon size={20} weight="bold" className="text-quaternary" />
      </div>
      <div className="attachment-item__body text-sm">
        <button
          type="button"
          className="font-medium text-secondary leading-none text-anchor"
          onClick={props.onClick}
        >
          {props.name}.csv
        </button>
        <p className="text-sm text-quaternary mb-0">{props.size}</p>
      </div>
      <div>
        <BaseButton
          onClick={props.onClick}
          iconNode={<DownloadSimpleIcon weight="bold" />}
          iconRight
          variant="text-primary"
          size="sm"
        />
      </div>
    </div>
  );
};

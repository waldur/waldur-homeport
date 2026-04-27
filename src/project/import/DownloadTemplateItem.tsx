import { DownloadSimpleIcon, FileCsvIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { CompactActionButton } from '@/table/CompactActionButton';

interface DownloadTemplateItemProps {
  name: string;
  size?: string;
  onClick(e?): void;
}

export const DownloadTemplateItem: FC<DownloadTemplateItemProps> = (props) => {
  return (
    <div className="attachment-item mb-6">
      <div className="attachment-item__thumb">
        <FileCsvIcon size={20} weight="bold" className="text-muted" />
      </div>
      <div className="attachment-item__body fs-6">
        <button
          type="button"
          className="fw-bold text-gray-700 lh-1 text-anchor"
          onClick={props.onClick}
        >
          {props.name}.csv
        </button>
        <p className="fs-6 text-muted mb-0">{props.size}</p>
      </div>
      <div>
        <CompactActionButton
          action={props.onClick}
          iconNode={<DownloadSimpleIcon weight="bold" />}
          iconRight
          variant="link"
        />
      </div>
    </div>
  );
};

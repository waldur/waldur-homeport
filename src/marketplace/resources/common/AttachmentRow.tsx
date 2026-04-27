import { PaperclipIcon, XIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { formatFilesize } from '@/core/utils';
import { FileUploadField } from '@/form';
import { translate } from '@/i18n';
import { ActionButton } from '@/table/ActionButton';

interface AttachmentRowProps {
  value: File | null | undefined;
  onChange: (file: File | null) => void;
  accept?: string;
  buttonLabel?: string;
  emptyLabel?: string;
}

export const AttachmentRow: FC<AttachmentRowProps> = ({
  value,
  onChange,
  accept = 'application/pdf',
  buttonLabel,
  emptyLabel,
}) => (
  <div className="d-flex justify-content-between">
    <FileUploadField
      iconNode={<PaperclipIcon weight="bold" />}
      input={{ value, onChange } as any}
      accept={accept}
      buttonLabel={buttonLabel ?? translate('Attach file')}
      className="btn btn-tertiary"
    />
    <div className="flex-grow-1 ms-3 align-items-center d-flex">
      <span className="text-muted fs-5">
        {value ? (
          <>
            {value.name} ({formatFilesize(value.size, 'B')})
          </>
        ) : (
          (emptyLabel ?? translate('Upload PDF file'))
        )}
      </span>
    </div>
    {value && (
      <ActionButton
        title={translate('Remove')}
        action={() => onChange(null)}
        iconNode={<XIcon weight="bold" />}
      />
    )}
  </div>
);

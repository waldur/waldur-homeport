import { PaperclipIcon, XIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { BaseButton } from 'waldur-ui';

import { formatFilesize } from '@/core/utils';
import { FileUploadField } from '@/form';
import { translate } from '@/i18n';

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
      variant="tertiary"
      size="md"
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
      <BaseButton
        label={translate('Remove')}
        onClick={() => onChange(null)}
        iconNode={<XIcon weight="bold" />}
        variant="tertiary"
        size="lg"
      />
    )}
  </div>
);

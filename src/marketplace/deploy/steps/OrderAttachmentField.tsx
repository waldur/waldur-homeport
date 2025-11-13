import { PaperclipIcon, XIcon } from '@phosphor-icons/react';
import { Field } from 'react-final-form';

import { formatFilesize } from '@waldur/core/utils';
import { required as requiredValidator } from '@waldur/core/validators';
import { FileUploadField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';

export const OrderAttachmentField = ({ required }) => (
  <Field
    name="attachment"
    validate={required ? requiredValidator : undefined}
    component={({ input }) => (
      <div className="d-flex justify-content-between">
        <FileUploadField
          iconNode={<PaperclipIcon weight="bold" />}
          input={input as any}
          accept="application/pdf"
          buttonLabel={translate('Attach file')}
          className="btn btn-tertiary"
        />
        <div className="flex-grow-1 ms-3 align-items-center d-flex">
          <span className="text-muted fs-5">
            {input.value ? (
              <>
                {input.value.name} ({formatFilesize(input.value.size, 'B')})
              </>
            ) : (
              translate('Upload PDF file')
            )}
          </span>
        </div>
        {input.value && (
          <ActionButton
            title={translate('Remove')}
            action={() => input.onChange(null)}
            iconNode={<XIcon weight="bold" />}
          />
        )}
      </div>
    )}
  />
);

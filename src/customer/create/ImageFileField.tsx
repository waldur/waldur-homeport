import { useRef, FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

export const ImageFileField: FunctionComponent<{ input; disabled }> = ({
  input,
  disabled,
}) => {
  const fileInput = useRef<HTMLInputElement>();
  return (
    <div>
      <input
        type="file"
        ref={fileInput}
        style={{ display: 'none' }}
        onChange={(event) => input.onChange(event.target.files[0])}
        accept=".jpg, .jpeg, .png, .svg"
      />
      <Button
        disabled={disabled}
        onClick={() => {
          fileInput.current.click();
        }}
      >
        {translate('Browse image')}
      </Button>
      {input.value && (
        <div>
          {input.value.name} ({formatFilesize(input.value.size, 'B')})
        </div>
      )}
    </div>
  );
};

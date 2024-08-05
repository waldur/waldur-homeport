import classNames from 'classnames';
import { FunctionComponent, useCallback, useEffect, useRef } from 'react';

import { Tip } from '@waldur/core/Tooltip';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import AvatarBlank from '@waldur/images/avatar-blank.svg';

import { FormField } from './types';

import './ImageField.scss';

type ImageType = File | string;

interface ImageFieldProps extends FormField {
  size?: number;
  initialValue?: ImageType;
}

const style = {
  height: 'auto',
  width: '100%',
  maxHeight: '100%',
  maxWidth: '100%',
};

const previewImage = (imageFile: ImageType, element: HTMLImageElement) => {
  if (!imageFile || !element) {
    return;
  }
  if (typeof imageFile === 'string') {
    element.src = imageFile;
  } else if (imageFile instanceof File) {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      // @ts-ignore
      element.src = fileReader.result;
    };
    fileReader.readAsDataURL(imageFile);
  }
};

export const ImageField: FunctionComponent<ImageFieldProps> = (props) => {
  const { input, initialValue } = props;
  const inputRef = useRef<HTMLInputElement>();
  const previewRef = useRef<HTMLImageElement>();

  const changeImage = useCallback(
    (imageFile: ImageType) => {
      input.onChange && input.onChange(imageFile);
      previewImage(imageFile, previewRef.current);
      if (!imageFile && inputRef.current) {
        inputRef.current.value = null;
      }
    },
    [previewRef, input],
  );

  useEffect(() => {
    previewImage(input.value, previewRef.current);
  }, [input.value, previewRef]);

  // Reset input on changing initial value
  useEffect(() => {
    changeImage(initialValue);
    // eslint-disable-next-line
  }, [initialValue]);

  const isChanged = Boolean(
    input.value instanceof File ||
      Boolean(input.value) !== Boolean(initialValue),
  );

  return (
    <>
      <div
        className={classNames('image-input image-input-outline', {
          'image-input-empty': !input.value,
          'image-input-changed': isChanged,
        })}
        data-kt-image-input="true"
      >
        <div className="w-100px h-100px d-flex align-items-center justify-content-center">
          {!input.value ? (
            <AvatarBlank style={style} />
          ) : (
            <img style={style} ref={previewRef} alt="preview" />
          )}
        </div>

        {/* Pick image */}
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label
          className="btn btn-icon btn-circle btn-color-muted btn-active-color-primary w-25px h-25px bg-body shadow"
          data-kt-image-input-action="change"
        >
          <Tip
            id="image-input-edit"
            label={translate('Change avatar')}
            className="w-100"
          >
            <i className="fa fa-pencil fs-6" />
          </Tip>

          <input
            ref={inputRef}
            type="file"
            name={input.name}
            accept=".png, .jpg, .jpeg"
            onChange={(event) => changeImage(event.target.files[0])}
          />
        </label>

        {/* Cancel image */}
        <button
          type="button"
          className="btn btn-icon btn-circle btn-color-muted btn-active-color-primary w-25px h-25px bg-body shadow"
          data-kt-image-input-action="cancel"
          onClick={() => changeImage(initialValue)}
        >
          <Tip
            id="image-input-cancel"
            label={translate('Reset avatar')}
            className="w-100"
          >
            <i className="fa fa-repeat fs-6" />
          </Tip>
        </button>

        {/* Remove image */}
        <button
          type="button"
          className="btn btn-icon btn-circle btn-color-muted btn-active-color-danger w-25px h-25px bg-body shadow"
          data-kt-image-input-action="remove"
          onClick={() => changeImage('')}
        >
          <Tip
            id="image-input-remove"
            label={translate('Remove avatar')}
            className="w-100"
          >
            <i className="fa fa-times fs-6" />
          </Tip>
        </button>
      </div>
      <div className="form-text">
        {isChanged && input.value instanceof File ? (
          <>
            {input.value.name} {formatFilesize(input.value.size, 'B')}
          </>
        ) : (
          <>{translate('Allowed file types')}: png, jpg, jpeg.</>
        )}
      </div>
    </>
  );
};

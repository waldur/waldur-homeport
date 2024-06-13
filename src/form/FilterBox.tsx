import { MagnifyingGlass } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, useEffect, useRef } from 'react';
import { Form, FormControlProps } from 'react-bootstrap';

interface FilterBoxProps extends FormControlProps {
  autoFocus?: boolean;
  solid?: boolean;
  inputClassName?: string;
}

export const FilterBox: FC<FilterBoxProps> = ({
  className,
  autoFocus,
  solid,
  inputClassName,
  ...props
}: any) => {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!autoFocus) {
      return;
    }
    if (!inputRef) {
      return;
    }
    inputRef?.current.focus();
  }, [inputRef, autoFocus]);
  return (
    <div className={classNames('position-relative', className)}>
      <span className="svg-icon svg-icon-2 text-gray-700 position-absolute top-50 translate-middle ms-6">
        <MagnifyingGlass weight="bold" />
      </span>
      <Form.Control
        type="text"
        className={classNames(
          solid && 'form-control-solid',
          'ps-10',
          inputClassName,
        )}
        {...props}
        ref={inputRef}
      />
    </div>
  );
};

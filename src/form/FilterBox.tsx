import { MagnifyingGlass } from '@phosphor-icons/react';
import classNames from 'classnames';
import { useEffect, useRef } from 'react';
import { Form } from 'react-bootstrap';

export const FilterBox = ({ className, autoFocus, solid, ...props }: any) => {
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
      <span className="svg-icon svg-icon-3 svg-icon-gray-500 position-absolute top-50 translate-middle ms-6">
        <MagnifyingGlass />
      </span>
      <Form.Control
        type="text"
        className={classNames(solid && 'form-control-solid', 'ps-10')}
        {...props}
        ref={inputRef}
      />
    </div>
  );
};

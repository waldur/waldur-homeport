import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, useEffect, useRef } from 'react';
import { Form, FormControlProps, InputGroup } from 'react-bootstrap';

interface FilterBoxProps extends FormControlProps {
  autoFocus?: boolean;
  inputClassName?: string;
}

export const FilterBox: FC<FilterBoxProps> = ({
  className,
  autoFocus,
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent form submission when Enter is pressed in search input
    if (e.key === 'Enter') {
      e.preventDefault();
    }
    // Call original onKeyDown if provided
    if (props.onKeyDown) {
      props.onKeyDown(e);
    }
  };

  return (
    <InputGroup className={classNames('has-icon', className)}>
      <div className="input-group-icon">
        <MagnifyingGlassIcon weight="bold" />
      </div>
      <Form.Control
        type="text"
        className={inputClassName}
        {...props}
        ref={inputRef}
        onKeyDown={handleKeyDown}
      />
    </InputGroup>
  );
};

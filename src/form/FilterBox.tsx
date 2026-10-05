import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import {
  ChangeEvent,
  forwardRef,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Form, FormControlProps, InputGroup } from 'react-bootstrap';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';

interface FilterBoxProps extends FormControlProps {
  autoFocus?: boolean;
  /**
   * Enter is swallowed so it doesn't submit an enclosing form. Pass false
   * when something above handles Enter itself (a combobox list selecting its
   * highlighted row).
   */
  preventEnterSubmit?: boolean;
  inputClassName?: string;
  rightAction?: ReactNode;
}

/** A search field; the ref is its input's. */
export const FilterBox = forwardRef<HTMLInputElement, FilterBoxProps>(
  (
    {
      className,
      autoFocus,
      inputClassName,
      rightAction,
      preventEnterSubmit = true,
      ...props
    }: any,
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current, []);
    useEffect(() => {
      if (!autoFocus) {
        return;
      }
      if (!inputRef) {
        return;
      }
      inputRef?.current.focus();
    }, [inputRef, autoFocus]);

    // A search box gets the clear button the header search has
    // (SearchInput.tsx), in place of the browser's own blue cross. The box may be controlled or
    // not, so its text is tracked here when no `value` is given.
    const isSearch = props.type === 'search';
    const [uncontrolledValue, setUncontrolledValue] = useState(
      props.defaultValue ?? '',
    );
    const value = props.value !== undefined ? props.value : uncontrolledValue;
    const showClear = isSearch && String(value ?? '') !== '' && !props.disabled;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      setUncontrolledValue(e.target.value);
      props.onChange?.(e);
    };

    // Clears the box as typing would, so every caller's onChange sees an
    // ordinary change event: React notices a value set past its own setter
    // and reports the input event that follows.
    const clear = () => {
      const input = inputRef.current;
      if (!input) return;
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      )?.set?.call(input, '');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Prevent form submission when Enter is pressed in search input
      if (preventEnterSubmit && e.key === 'Enter') {
        e.preventDefault();
      }
      // Call original onKeyDown if provided
      if (props.onKeyDown) {
        props.onKeyDown(e);
      }
    };

    return (
      <InputGroup
        className={classNames(
          'has-icon',
          (rightAction || showClear) && 'has-icon-right',
          className,
        )}
      >
        <div className="input-group-icon">
          <MagnifyingGlassIcon weight="bold" />
        </div>
        <Form.Control
          type="text"
          className={classNames(
            isSearch && '[&::-webkit-search-cancel-button]:appearance-none',
            // Room for the clear button beside a right action.
            rightAction && showClear && 'pe-[76px]!',
            inputClassName,
          )}
          {...props}
          ref={inputRef}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        {(rightAction || showClear) && (
          <div className="input-group-icon input-group-icon-right d-flex align-items-center gap-2">
            {showClear && (
              <BaseButton
                size="sm"
                variant="text-secondary"
                onClick={clear}
                iconNode={<XIcon weight="bold" />}
                tooltip={translate('Clear')}
              />
            )}
            {rightAction}
          </div>
        )}
      </InputGroup>
    );
  },
);
FilterBox.displayName = 'FilterBox';

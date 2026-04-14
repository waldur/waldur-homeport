import { PencilSimpleIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FunctionComponent } from 'react';
import { ButtonProps } from 'react-bootstrap';
import { Variant } from 'react-bootstrap/esm/types';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';
import { CompactActionButton } from '@waldur/table/CompactActionButton';

export interface EditButtonProps extends ButtonProps {
  disabled?: boolean;
  tooltip?: string;
  label?: string;
  state?: string;
  params?: any;
  iconRight?: boolean;
  variant?: Variant;
  size?: 'sm' | 'lg';
  width?: number | 'auto';
  btnIcon?: boolean;
}

export const EditButton: FunctionComponent<EditButtonProps> = (props) => {
  const {
    label = translate('Edit'),
    onClick,
    state,
    params,
    iconRight = true,
    variant = 'tertiary',
    size = 'sm',
    width = 90,
    btnIcon,
    className,
    disabled,
    tooltip,
    ...rest
  } = props;

  const widthClass = btnIcon
    ? ''
    : `min-w-sm-${width === 'auto' ? width : width + 'px'}`;

  return state ? (
    <Link
      state={state}
      params={params}
      className={classNames(
        `btn btn-${variant}`,
        btnIcon && 'btn-icon',
        size && `btn-${size}`,
        iconRight && 'btn-icon-right',
        widthClass,
        className,
      )}
      {...rest}
    >
      {!btnIcon && iconRight && label}
      <span
        className={`svg-icon svg-icon-${size === 'sm' && !btnIcon ? '4' : '2'}`}
      >
        <PencilSimpleIcon weight="bold" />
      </span>
      {!btnIcon && !iconRight && label}
    </Link>
  ) : size === 'sm' ? (
    <CompactActionButton
      action={onClick}
      iconNode={<PencilSimpleIcon weight="bold" />}
      title={!btnIcon && label}
      variant={variant}
      iconRight={iconRight}
      className={classNames(widthClass, className)}
      disabled={disabled}
      tooltip={tooltip}
      {...rest}
    />
  ) : (
    <ActionButton
      action={onClick}
      iconNode={<PencilSimpleIcon weight="bold" />}
      title={!btnIcon && label}
      variant={variant}
      iconRight={iconRight}
      className={classNames(widthClass, className)}
      disabled={disabled}
      tooltip={tooltip}
      {...rest}
    />
  );
};

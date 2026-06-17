import { PencilSimpleIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FunctionComponent } from 'react';
import { ButtonProps } from 'react-bootstrap';
import { Variant } from 'react-bootstrap/esm/types';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { ActionButton } from '@/table/ActionButton';
import { CompactActionButton } from '@/table/CompactActionButton';

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
  iconNode?: React.ReactNode;
  'data-testid'?: string;
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
    iconNode = <PencilSimpleIcon weight="bold" />,
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
        {iconNode}
      </span>
      {!btnIcon && !iconRight && label}
    </Link>
  ) : size === 'sm' ? (
    <CompactActionButton
      action={onClick}
      iconNode={iconNode}
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
      iconNode={iconNode}
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

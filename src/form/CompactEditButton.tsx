import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent, ReactNode } from 'react';

import { BaseButton, BaseButtonProps, ButtonVariant } from 'waldur-ui';

export interface CompactEditButtonProps extends Omit<
  BaseButtonProps,
  'size' | 'label'
> {
  iconNode?: ReactNode;
  variant?: ButtonVariant;
  'data-testid'?: string;
}

/**
 * Compact edit button for inline field editing in forms, settings rows, and data tables.
 * Uses small size to fit alongside form fields without dominating the layout.
 */
export const CompactEditButton: FunctionComponent<CompactEditButtonProps> = ({
  iconNode = <PencilSimpleIcon weight="bold" />,
  variant = 'tertiary',
  'data-testid': dataTestId = 'compact-edit-button',
  ...props
}) => (
  <BaseButton
    size="sm"
    variant={variant}
    iconNode={iconNode}
    data-testid={dataTestId}
    {...props}
  />
);

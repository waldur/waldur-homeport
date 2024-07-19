import { UISref } from '@uirouter/react';
import classNames from 'classnames';
import { PropsWithChildren, forwardRef } from 'react';
import { Breadcrumb, BreadcrumbItemProps } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
import { TruncatedText } from '@waldur/core/TruncatedText';
import { truncate as truncateText } from '@waldur/core/utils';

interface OwnProps extends BreadcrumbItemProps {
  key: string;
  ellipsis?: 'md' | 'xl' | 'xxl';
  truncate?: boolean;
  maxLength?: number; // to truncate title always
  to?: string;
  params?: object;
  ref?;
}

export const BreadcrumbItem = forwardRef<any, PropsWithChildren<OwnProps>>(
  (props, ref) => {
    const {
      key,
      ellipsis = undefined,
      truncate,
      maxLength,
      children,
      className,
      to,
      params,
      ...rest
    } = props;
    const ellipsisClass = ellipsis ? 'ellipsis-' + ellipsis : '';
    const item = (
      <Breadcrumb.Item
        {...rest}
        ref={ref}
        className={classNames(className, ellipsisClass)}
      >
        {typeof children === 'string' ? (
          maxLength ? (
            <span>
              {children.length > maxLength + 5 ? (
                <Tip
                  label={children}
                  id={'tip-breadcrumb-' + key}
                  placement="bottom"
                >
                  {truncateText(children, maxLength)}
                </Tip>
              ) : (
                children
              )}
            </span>
          ) : truncate ? (
            <TruncatedText text={children} padding={25} />
          ) : (
            <span>{children}</span>
          )
        ) : (
          <span>{children}</span>
        )}
      </Breadcrumb.Item>
    );

    return to ? (
      <UISref to={to} params={params}>
        {item}
      </UISref>
    ) : (
      item
    );
  },
);

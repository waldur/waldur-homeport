import { UISref } from '@uirouter/react';
import classNames from 'classnames';
import { PropsWithChildren, forwardRef } from 'react';
import { Breadcrumb, BreadcrumbItemProps } from 'react-bootstrap';

import { TruncatedText } from '@waldur/core/TruncatedText';

interface OwnProps extends BreadcrumbItemProps {
  ellipsis?: 'md' | 'xl' | 'xxl';
  truncate?: boolean;
  to?: string;
  params?: object;
  ref?;
}

export const BreadcrumbItem = forwardRef<any, PropsWithChildren<OwnProps>>(
  (props, ref) => {
    const {
      ellipsis = undefined,
      truncate,
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
        {typeof children === 'string' && truncate ? (
          <TruncatedText text={children} padding={25} />
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

import { CaretLeftIcon } from '@phosphor-icons/react';
import { useSref } from '@uirouter/react';
import classNames from 'classnames';
import { uniqueId } from 'lodash-es';
import { PropsWithChildren, forwardRef } from 'react';
import { Breadcrumb, BreadcrumbItemProps } from 'react-bootstrap';

import { Tip } from '@/core/Tooltip';
import { TruncatedText } from '@/core/TruncatedText';
import { truncate as truncateText } from '@/core/utils';
import { translate } from '@/i18n';

interface OwnProps extends BreadcrumbItemProps {
  ellipsis?: 'md' | 'xl' | 'xxl';
  truncate?: boolean;
  maxLength?: number; // to truncate title always
  tooltipText?: string;
  isBack?: boolean;
  to?: string;
  params?: object;
  ref?;
}

export const BreadcrumbItem = forwardRef<any, PropsWithChildren<OwnProps>>(
  (
    {
      ellipsis = undefined,
      truncate,
      maxLength,
      tooltipText,
      isBack,
      children,
      className,
      to,
      params,
      onClick,
      ...rest
    },
    ref,
  ) => {
    const ellipsisClass = ellipsis ? 'ellipsis-' + ellipsis : '';
    const isLink = Boolean(to);
    const sref = useSref(to ?? 'profile.details', params);
    const isStatic = !isLink && !onClick;

    const handleClick =
      isLink || onClick
        ? (event) => {
            if (isLink) {
              sref?.onClick?.(event);
            }
            onClick?.(event);
          }
        : undefined;

    return (
      <Breadcrumb.Item
        {...rest}
        {...(isLink ? sref : {})}
        linkAs={isStatic ? 'span' : undefined}
        linkProps={
          isStatic
            ? { className: 'breadcrumb-item-static-label', tabIndex: undefined }
            : undefined
        }
        onClick={handleClick}
        ref={ref}
        className={classNames(className, ellipsisClass, {
          'breadcrumb-item-static': isStatic,
        })}
      >
        {isBack && (
          <>
            <CaretLeftIcon
              weight="bold"
              size={24}
              className="breadcrumb-back"
            />
            {translate('Go back to')}&nbsp;
          </>
        )}
        {typeof children === 'string' ? (
          maxLength ? (
            <span>
              {children.length > maxLength + 5 ? (
                <Tip
                  label={children}
                  id={'tip-breadcrumb-' + uniqueId()}
                  placement="bottom"
                >
                  {truncateText(children, maxLength)}
                </Tip>
              ) : (
                children
              )}
            </span>
          ) : truncate ? (
            <TruncatedText
              text={children}
              tooltipText={tooltipText}
              padding={10}
            />
          ) : (
            <span>{children}</span>
          )
        ) : (
          <span>{children}</span>
        )}
      </Breadcrumb.Item>
    );
  },
);

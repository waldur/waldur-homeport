import { DotsThreeVerticalIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, PropsWithChildren, ReactNode } from 'react';

import { BaseButton, Menu } from 'waldur-ui';

import { translate } from '@/i18n';
import { ActionsMenu } from '@/table/ActionsDropdown';

interface WidgetCardAction {
  label: string;
  icon: ReactNode;
  callback();
}

interface WidgetCardProps {
  cardTitle: ReactNode;
  title?: ReactNode;
  meta?: ReactNode;
  actions?: WidgetCardAction[];
  cardAction?: ReactNode;
  className?: string;
  right?: ReactNode;
  left?: ReactNode;
  cardBordered?: boolean;
}

export const WidgetCard: FC<PropsWithChildren<WidgetCardProps>> = ({
  cardTitle,
  title,
  meta,
  actions,
  cardAction,
  className,
  children,
  right,
  left,
  cardBordered = true,
}) => {
  return (
    <div
      className={classNames(
        'card card-widget',
        cardBordered && 'card-bordered',
        className,
      )}
    >
      <div className="card-body flex">
        {left && <div className="me-3 shrink-0">{left}</div>}
        <div className="flex flex-col grow">
          <div
            className={classNames(
              'flex items-center gap-2.5 ',
              actions?.length,
            )}
          >
            <div className="card-title font-medium grow h4 mb-0">
              {cardTitle}
            </div>
            {cardAction && <div className="p-0 m-0 shrink-0">{cardAction}</div>}
            {actions?.length > 0 && (
              <ActionsMenu
                side="bottom"
                align="center"
                toggle={
                  <BaseButton
                    variant="text-secondary"
                    size="sm"
                    tooltip={translate('More actions')}
                    iconNode={
                      <DotsThreeVerticalIcon
                        size={20}
                        weight="bold"
                        className="text-quinary"
                      />
                    }
                  />
                }
              >
                {actions.map((action, index) => (
                  <Menu.Item
                    key={index}
                    icon={action.icon}
                    onSelect={action.callback}
                  >
                    {action.label}
                  </Menu.Item>
                ))}
              </ActionsMenu>
            )}
          </div>
          {(title || meta || right) && (
            // pt-1.5 and the extra 1.5 in gap-y: the space Bootstrap's g-2 gutter
            // put above each line of the row, which mt-auto kept from being
            // cancelled.
            <div className="flex flex-wrap items-end justify-between mt-auto pt-1.5 gap-x-3 gap-y-4.5">
              {(title || meta) && (
                <div className="flex-1 max-w-full">
                  <div className="flex flex-wrap items-center gap-3 mb-1.5">
                    <h1 className="mb-0 whitespace-nowrap text-2xl flex-1 max-w-full sm:basis-full md:flex-1 2xl:basis-full">
                      {title}
                    </h1>
                    {meta && (
                      <div className="flex-none text-secondary whitespace-nowrap text-sm">
                        {meta}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {right}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

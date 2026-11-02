import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { translate } from 'waldur-i18n-runtime';

import { BaseButton } from '../Button';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';

import type { PropertyCardProps } from './types';

export const PropertyCard: FC<PropertyCardProps> = ({
  refreshLabel = translate('Refresh'),
  loadingLabel = translate('Loading'),
  ...props
}) => {
  return (
    <Card
      data-slot="property-card"
      bordered={props.bordered}
      className={props.className}
    >
      {Boolean(props.title) && (
        <CardHeader className={props.headerClassName}>
          <div className="my-[0.5rem] mr-[0.5rem] ml-0 flex items-center gap-2">
            <CardTitle size="lg" className="my-0 mr-0">
              {props.title}
            </CardTitle>
            {props.refetch &&
              (props.loading ? (
                <BaseButton
                  iconNode={
                    <span className="animation-spin">
                      <ArrowsClockwiseIcon weight="bold" />
                    </span>
                  }
                  tooltip={loadingLabel}
                  onClick={() => {}}
                  variant="text-secondary"
                  disabled
                  size="lg"
                />
              ) : (
                <BaseButton
                  variant="text-secondary"
                  onClick={props.refetch}
                  tooltip={refreshLabel}
                  iconNode={<ArrowsClockwiseIcon size={20} weight="bold" />}
                />
              ))}
          </div>
          {Boolean(props.actions) && (
            <div className="my-[0.5rem] flex grow flex-wrap items-center justify-end gap-2.5">
              {props.actions}
            </div>
          )}
        </CardHeader>
      )}
      <CardContent className="pt-0 pb-4">{props.children}</CardContent>
    </Card>
  );
};

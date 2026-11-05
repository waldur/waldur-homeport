import { FunctionComponent } from 'react';

import {
  PropertyList,
  PropertyItem,
  Card,
  CardContent,
  CardHeader,
} from 'waldur-ui';

import { SafeMarkdown } from '@/core/SafeMarkdown';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { Call } from './types';
import { getActiveRound } from './utils';

export const PublicCallExpandableRow: FunctionComponent<{
  row: Call;
}> = ({ row }) => {
  const activeRound = getActiveRound(row);

  return (
    <ExpandableContainer>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-5">
        <div className="col-span-full text-primary mb-1.5">
          {row.description ? (
            <Card bordered variant="solid">
              <CardHeader>
                <h6 className="mb-0 font-medium">{translate('Description')}</h6>
              </CardHeader>
              <CardContent>
                <SafeMarkdown text={row.description} smallTitles />
              </CardContent>
            </Card>
          ) : (
            <p className="text-quaternary italic text-xs mb-0">
              {translate('No description')}
            </p>
          )}
        </div>

        {activeRound ? (
          <div>
            <PropertyList variant="summary" termWidth="md">
              <PropertyItem
                label={translate('Next cutoff')}
                value={propVal.date(activeRound.cutoff_time, {
                  precision: 'datetime',
                })}
              />
            </PropertyList>
          </div>
        ) : (
          <div className="col-span-full">
            <p className="text-quaternary italic text-xs mb-0">
              {translate('No active round')}
            </p>
          </div>
        )}
      </div>
    </ExpandableContainer>
  );
};

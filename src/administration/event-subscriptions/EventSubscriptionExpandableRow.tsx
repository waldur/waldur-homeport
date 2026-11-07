import { FC } from 'react';
import { EventSubscription } from 'waldur-js-client';

import {
  Code,
  PropertyItem,
  PropertyList,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { ExpandableContainer } from '@/table/ExpandableContainer';

interface EventSubscriptionExpandableRowProps {
  row: EventSubscription;
}

export const EventSubscriptionExpandableRow: FC<
  EventSubscriptionExpandableRowProps
> = ({ row }) => {
  const observableObjects = row.observable_objects;

  return (
    <ExpandableContainer>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
        <div>
          <PropertyList variant="summary" termWidth="md" hideIfEmpty={false}>
            <PropertyList.Section title={translate('Subscription details')}>
              <PropertyItem
                label={translate('UUID')}
                value={propVal.code(row.uuid)}
              />
              <PropertyItem
                label={translate('User UUID')}
                value={propVal.code(row.user_uuid)}
              />
              <PropertyItem
                label={translate('Username')}
                value={row.user_username}
              />
              <PropertyItem
                label={translate('Full name')}
                value={row.user_full_name}
              />
              <PropertyItem
                label={translate('Source IP')}
                value={propVal.code(row.source_ip)}
              />
            </PropertyList.Section>
          </PropertyList>
        </div>
        <div>
          <h6 className="mb-2.5">{translate('Observable objects')}</h6>
          {observableObjects && observableObjects.length > 0 ? (
            <Table density="compact">
              <TableHeader>
                <TableRow>
                  <TableHead>{translate('Object type')}</TableHead>
                  <TableHead>{translate('Offering UUID')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {observableObjects.map((obj, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Code>{obj.object_type}</Code>
                    </TableCell>
                    <TableCell>
                      <Code className="text-quaternary">
                        {obj.offering_uuid?.substring(0, 8)}...
                      </Code>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-quaternary">
              {translate('No observable objects configured')}
            </p>
          )}
        </div>
      </div>
    </ExpandableContainer>
  );
};

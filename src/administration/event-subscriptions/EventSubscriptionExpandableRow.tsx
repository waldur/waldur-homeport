import { FC } from 'react';
import { EventSubscription } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import { renderFieldOrDash } from '@waldur/table/utils';

interface EventSubscriptionExpandableRowProps {
  row: EventSubscription;
}

export const EventSubscriptionExpandableRow: FC<
  EventSubscriptionExpandableRowProps
> = ({ row }) => {
  const observableObjects = row.observable_objects as
    | Array<{ offering_uuid: string; object_type: string }>
    | undefined;

  return (
    <ExpandableContainer>
      <div className="row">
        <div className="col-md-6">
          <h6 className="mb-3">{translate('Subscription details')}</h6>
          <table className="table table-sm">
            <tbody>
              <tr>
                <td className="text-muted">{translate('UUID')}</td>
                <td>
                  <code>{row.uuid}</code>
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('User UUID')}</td>
                <td>
                  <code>{row.user_uuid}</code>
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Username')}</td>
                <td>{row.user_username}</td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Full name')}</td>
                <td>{renderFieldOrDash(row.user_full_name)}</td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Source IP')}</td>
                <td>
                  <code>{renderFieldOrDash(row.source_ip)}</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="col-md-6">
          <h6 className="mb-3">{translate('Observable objects')}</h6>
          {observableObjects && observableObjects.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-sm table-bordered">
                <thead>
                  <tr>
                    <th>{translate('Object type')}</th>
                    <th>{translate('Offering UUID')}</th>
                  </tr>
                </thead>
                <tbody>
                  {observableObjects.map((obj, index) => (
                    <tr key={index}>
                      <td>
                        <code>{obj.object_type}</code>
                      </td>
                      <td>
                        <code className="text-muted">
                          {obj.offering_uuid?.substring(0, 8)}...
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted">
              {translate('No observable objects configured')}
            </p>
          )}
        </div>
      </div>
    </ExpandableContainer>
  );
};

import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { formatDateTime } from '@/core/dateUtils';
import { SafeMarkdown } from '@/core/SafeMarkdown';
import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
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
            <Card className="card-bordered card-solid">
              <Card.Header>
                <h6 className="mb-0 font-medium">{translate('Description')}</h6>
              </Card.Header>
              <Card.Body>
                <SafeMarkdown text={row.description} smallTitles />
              </Card.Body>
            </Card>
          ) : (
            <p className="text-quaternary italic text-xs mb-0">
              {translate('No description')}
            </p>
          )}
        </div>

        {activeRound ? (
          <div>
            <Field
              label={translate('Next cutoff')}
              value={formatDateTime(activeRound.cutoff_time)}
              labelCol={4}
              valueCol={8}
            />
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

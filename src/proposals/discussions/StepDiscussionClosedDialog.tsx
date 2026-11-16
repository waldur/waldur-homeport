import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import {
  matrixExportsRetrieve,
  proposalStepDiscussionsRetrieve,
} from 'waldur-js-client';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { FileDownloader } from '@/form/upload/FileDownloader';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { propVal } from '@/property/propertyFields';

interface StepDiscussionClosedDialogProps {
  resolve: { discussionUuid: string };
}

/**
 * How a discussion went: when it ran, who took part -- while it is open, who
 * is in its room -- and, once closed, for the call's managers, staff and
 * support, the export of its history.
 */
export const StepDiscussionClosedDialog: FC<
  StepDiscussionClosedDialogProps
> = ({ resolve: { discussionUuid } }) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['step-discussion', discussionUuid],
    queryFn: () =>
      proposalStepDiscussionsRetrieve({ path: { uuid: discussionUuid } }).then(
        (response) => response.data,
      ),
  });
  const exportUuid = data?.export_uuid;
  const { data: historyExport } = useQuery({
    queryKey: ['matrix-export', exportUuid],
    queryFn: () =>
      matrixExportsRetrieve({ path: { uuid: exportUuid! } }).then(
        (response) => response.data,
      ),
    enabled: Boolean(exportUuid),
  });

  return (
    <ModalDialog
      title={
        data?.state === 'open'
          ? translate('Discussion')
          : translate('Discussion closed')
      }
      subtitle={data?.step_name}
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred
          message={translate('Unable to load the discussion.')}
          loadData={refetch}
        />
      ) : data ? (
        <PropertyList variant="summary">
          <PropertyItem label={translate('Call')} value={data.call_name} />
          <PropertyItem
            label={translate('Proposal')}
            value={data.proposal_name}
          />
          <PropertyItem label={translate('Round')} value={data.round_name} />
          <PropertyItem label={translate('Panel')} value={data.panel_name} />
          <PropertyItem
            label={translate('Opened')}
            value={propVal.date(data.opened_at, { precision: 'datetime' })}
          />
          <PropertyItem
            label={translate('Closed')}
            value={propVal.date(data.closed_at, { precision: 'datetime' })}
          />
          <PropertyItem
            label={
              data.state === 'open'
                ? translate('Taking part')
                : translate('Took part')
            }
            value={propVal.list(
              data.participants.map(
                (person) => person.full_name || person.username,
              ),
              { display: 'stack' },
            )}
            hideIfEmpty={false}
          />
          {historyExport?.export_file_url ? (
            <PropertyItem
              label={translate('History')}
              value={
                <FileDownloader
                  url={historyExport.export_file_url}
                  name={`discussion-${data.step_key}-${data.uuid}.json`}
                >
                  {translate('Download the exported history')}
                </FileDownloader>
              }
            />
          ) : null}
        </PropertyList>
      ) : null}
    </ModalDialog>
  );
};

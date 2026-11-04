import { useQuery } from '@tanstack/react-query';
import { FC, useState } from 'react';
import {
  HpcJob,
  HpcJobStream,
  hpcWorkspacesJobsOutputRetrieve,
} from 'waldur-js-client';

import { Code, SegmentedControl, Tabs } from 'waldur-ui';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';

import { HpcErrorAlert } from './HpcErrorAlert';
import { HPC_QUERY_OPTIONS, hpcQueryKey } from './queries';

const LINE_OPTIONS = [100, 500, 2000];

export const HpcTextPane: FC<{
  content?: string | null;
  path?: string | null;
  empty: string;
  verbose: string;
  /** Longest the text grows before it scrolls. */
  maxHeight?: string | number;
}> = ({ content, path, empty, verbose, maxHeight = '60vh' }) => (
  <div>
    {path && (
      <div className="text-tertiary text-xs mb-2 wrap-anywhere">
        <Code>{path}</Code>
      </div>
    )}
    {content ? (
      <div className="relative">
        <div className="absolute end-0 top-0 p-2">
          <CopyToClipboardButton value={content} verbose={verbose} />
        </div>
        <pre
          className="bg-tertiary rounded-lg p-4 text-xs mb-0 overflow-auto"
          style={{ maxHeight }}
        >
          {content}
        </pre>
      </div>
    ) : (
      <div className="text-tertiary">{empty}</div>
    )}
  </div>
);

const StreamPane: FC<{ stream?: HpcJobStream; verbose: string }> = ({
  stream,
  verbose,
}) => (
  <HpcTextPane
    content={stream?.content}
    path={stream?.path}
    empty={translate('No output yet.')}
    verbose={verbose}
  />
);

export const HpcJobOutputDialog: FC<{
  resolve: { resourceUuid: string; job: HpcJob };
}> = ({ resolve: { resourceUuid, job } }) => {
  const [lines, setLines] = useState(100);
  const { data, isLoading, error } = useQuery({
    queryKey: hpcQueryKey(resourceUuid, 'job-output', job.job_id, lines),
    queryFn: () =>
      hpcWorkspacesJobsOutputRetrieve({
        path: { uuid: resourceUuid, job_id: job.job_id },
        query: { lines },
      }).then((response) => response.data),
    ...HPC_QUERY_OPTIONS,
  });

  return (
    <ModalDialog
      title={translate('Job output')}
      subtitle={
        <ScopeSubtitle
          label={translate('Job')}
          name={`${job.job_id} · ${job.name}`}
        />
      }
    >
      <div className="flex items-center justify-end gap-3 mb-4">
        <span className="text-tertiary text-xs">{translate('Last lines')}</span>
        <SegmentedControl<string>
          aria-label={translate('Last lines')}
          options={LINE_OPTIONS.map((value) => ({
            value: String(value),
            label: String(value),
          }))}
          value={String(lines)}
          onValueChange={(value) => setLines(Number(value))}
          size="sm"
        />
      </div>
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <HpcErrorAlert error={error} />
      ) : (
        <Tabs
          defaultValue="stdout"
          listProps={{ className: 'mb-4' }}
          items={[
            {
              value: 'stdout',
              title: translate('Standard output'),
              content: (
                <StreamPane
                  stream={data?.standard_output}
                  verbose={translate('Standard output')}
                />
              ),
            },
            {
              value: 'stderr',
              title: translate('Standard error'),
              content: (
                <StreamPane
                  stream={data?.standard_error}
                  verbose={translate('Standard error')}
                />
              ),
            },
            {
              value: 'script',
              title: translate('Script'),
              content: (
                <HpcTextPane
                  content={data?.script}
                  empty={translate('The cluster did not return the script.')}
                  verbose={translate('Script')}
                />
              ),
            },
          ]}
        />
      )}
    </ModalDialog>
  );
};

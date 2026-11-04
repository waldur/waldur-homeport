import { useQuery } from '@tanstack/react-query';
import { FC, ReactNode } from 'react';
import { hpcWorkspacesFileContentRetrieve } from 'waldur-js-client';

import { Tabs } from 'waldur-ui';

import { ChartSpecView } from '@/core/charts/ChartSpecView';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';

import { HpcErrorAlert } from './HpcErrorAlert';
import { HpcTextPane } from './HpcJobOutputDialog';
import { HPC_QUERY_OPTIONS, hpcQueryKey, useHpcOutputSeries } from './queries';
import { isHtmlReport, isPlottableFile } from './utils';

export type HpcFileTab = 'content' | 'plot';

/**
 * An HTML report from the cluster (e.g. MultiQC) in a frame without
 * allow-same-origin: its scripts run in an opaque origin and cannot reach
 * the portal, its cookies or its API.
 *
 * Reports are authored for a white page, as a browser tab shows them; the
 * frame is transparent by default, so in the dark theme their text would sit
 * on the dark dialog. The frame keeps a light page whatever the theme.
 */
const REPORT_PAGE_STYLE = {
  height: '65vh',
  colorScheme: 'light',
} as const;

const HtmlReport: FC<{ html: string }> = ({ html }) => (
  <iframe
    title={translate('Report')}
    sandbox="allow-scripts"
    srcDoc={html}
    className="w-full rounded-lg border border-secondary bg-white dark:bg-white"
    style={REPORT_PAGE_STYLE}
  />
);

/** A GROMACS .xvg, CSV/TSV table or WRF rsl log, plotted by the backend. */
const PlotPane: FC<{ resourceUuid: string; path: string }> = ({
  resourceUuid,
  path,
}) => {
  const { data, isLoading, error } = useHpcOutputSeries(resourceUuid, path);
  if (isLoading) return <LoadingSpinner />;
  if (error) {
    return (
      <HpcErrorAlert error={error} title={translate('Unable to plot file')} />
    );
  }
  return data ? (
    <>
      {data.title && <div className="font-medium mb-2">{data.title}</div>}
      <ChartSpecView spec={data.chart} hideTitle height={420} />
    </>
  ) : null;
};

const useFileContent = (resourceUuid: string, path: string) =>
  useQuery({
    queryKey: hpcQueryKey(resourceUuid, 'file-content', path),
    queryFn: () =>
      hpcWorkspacesFileContentRetrieve({
        path: { uuid: resourceUuid },
        query: { path },
      }).then((response) => response.data),
    ...HPC_QUERY_OPTIONS,
  });

/** The file's text. */
const ContentPane: FC<{ resourceUuid: string; path: string }> = ({
  resourceUuid,
  path,
}) => {
  const { data, isLoading, error } = useFileContent(resourceUuid, path);
  if (isLoading) return <LoadingSpinner />;
  if (error) {
    return (
      <HpcErrorAlert error={error} title={translate('Unable to open file')} />
    );
  }
  return (
    <HpcTextPane
      content={data?.content}
      empty={translate('The file is empty.')}
      verbose={translate('File content')}
    />
  );
};

/** An HTML report, rendered, with its source on the next tab. */
const ReportTabs: FC<{ resourceUuid: string; path: string }> = ({
  resourceUuid,
  path,
}) => {
  const { data } = useFileContent(resourceUuid, path);
  const content = <ContentPane resourceUuid={resourceUuid} path={path} />;
  if (!data?.content) return content;
  return (
    <Tabs
      defaultValue="report"
      listProps={{ className: 'mb-4' }}
      items={[
        {
          value: 'report',
          title: translate('Report'),
          content: <HtmlReport html={data.content} />,
        },
        { value: 'source', title: translate('Source'), content },
      ]}
    />
  );
};

/**
 * A file from the cluster: its text, plus a rendered view where one exists
 * (an HTML report, or a plot of a data file). Only the open tab loads.
 */
export const HpcFileContentDialog: FC<{
  resolve: { resourceUuid: string; path: string; tab?: HpcFileTab };
}> = ({ resolve: { resourceUuid, path, tab = 'content' } }) => {
  const content = <ContentPane resourceUuid={resourceUuid} path={path} />;
  let body: ReactNode = content;
  if (isPlottableFile(path)) {
    body = (
      <Tabs
        defaultValue={tab}
        listProps={{ className: 'mb-4' }}
        items={[
          { value: 'content', title: translate('Content'), content },
          {
            value: 'plot',
            title: translate('Plot'),
            content: <PlotPane resourceUuid={resourceUuid} path={path} />,
          },
        ]}
      />
    );
  } else if (isHtmlReport(path)) {
    body = <ReportTabs resourceUuid={resourceUuid} path={path} />;
  }

  return (
    <ModalDialog
      title={translate('File')}
      subtitle={<ScopeSubtitle label={translate('Path')} name={path} />}
    >
      {body}
    </ModalDialog>
  );
};

import { FC } from 'react';

import { Tabs } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';

// Monaco is several megabytes: it loads when a script is first shown, not
// with the page or the assistant.
const MonacoEditor = lazyComponent(() =>
  import('@/form/MonacoEditor').then((module) => ({
    default: module.MonacoEditor,
  })),
);

export interface HpcJobFile {
  name: string;
  content: string;
}

const LANGUAGES: Record<string, string> = {
  py: 'python',
  sh: 'shell',
  bash: 'shell',
  r: 'r',
  jl: 'julia',
  c: 'c',
  h: 'c',
  cc: 'cpp',
  cpp: 'cpp',
  hpp: 'cpp',
  js: 'javascript',
  json: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  md: 'markdown',
  sql: 'sql',
};

/** Monaco's language for a file, from its extension. */
export const getFileLanguage = (name: string) =>
  LANGUAGES[name.split('.').pop()?.toLowerCase() ?? ''] ?? 'plaintext';

/**
 * A job's batch script and the files it writes, one tab each, highlighted and
 * read-only. A program the job runs opens first: it is what the user reads;
 * the batch script around it is the same in every job.
 */
export const HpcScriptViewer: FC<{
  script: string;
  files?: HpcJobFile[];
  height: number | string;
}> = ({ script, files = [], height }) => (
  <Tabs
    listProps={{ className: 'mb-3' }}
    items={[
      ...files.map((file) => ({
        value: `file-${file.name}`,
        title: file.name,
        content: (
          <MonacoEditor
            value={file.content}
            language={getFileLanguage(file.name)}
            height={height}
            readOnly
          />
        ),
      })),
      {
        value: 'script',
        title: translate('Batch script'),
        content: (
          <MonacoEditor
            value={script}
            language="shell"
            height={height}
            readOnly
          />
        ),
      },
    ]}
  />
);

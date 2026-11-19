import { FC, useState } from 'react';
import { S3BrowserInfo } from 'waldur-js-client';

import { Code, FormText, SegmentedControl } from 'waldur-ui';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { formatFilesize } from '@/core/utils';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';

type ClientId = 'aws' | 'rclone' | 's3cmd';

const secretPlaceholder = (target: Target) =>
  target.keysTabHidden
    ? '<secret key>'
    : '<secret key: Reveal on the API keys tab>';

interface Target {
  info: S3BrowserInfo;
  bucket?: string;
  prefix?: string;
  /** The offering hides the API keys tab, so the secret is not revealed here. */
  keysTabHidden?: boolean;
}

const awsSnippet = (target: Target) => {
  const { info, bucket, prefix } = target;
  const SECRET = secretPlaceholder(target);
  const dest = bucket ? `s3://${bucket}/${prefix ?? ''}` : 's3://<bucket>/';
  return [
    `export AWS_ACCESS_KEY_ID=${info.access_key}`,
    `export AWS_SECRET_ACCESS_KEY='${SECRET}'`,
    `export AWS_DEFAULT_REGION=${info.region}`,
    '',
    '# One file; aws splits large files into parts by itself',
    `aws --endpoint-url ${info.endpoint} s3 cp ./my-file ${dest}`,
    '# A whole folder',
    `aws --endpoint-url ${info.endpoint} s3 sync ./my-folder ${dest}`,
  ].join('\n');
};

const rcloneSnippet = (target: Target) => {
  const { info, bucket, prefix } = target;
  const SECRET = secretPlaceholder(target);
  const dest = bucket ? `waldur:${bucket}/${prefix ?? ''}` : 'waldur:<bucket>/';
  return [
    '# ~/.config/rclone/rclone.conf',
    '[waldur]',
    'type = s3',
    'provider = Ceph',
    `endpoint = ${info.endpoint}`,
    `region = ${info.region}`,
    `access_key_id = ${info.access_key}`,
    `secret_access_key = ${SECRET}`,
    'force_path_style = true',
    '',
    '# One file',
    `rclone copy --progress ./my-file ${dest}`,
    '# A whole folder',
    `rclone copy --progress ./my-folder ${dest}`,
  ].join('\n');
};

const s3cmdSnippet = (target: Target) => {
  const { info, bucket, prefix } = target;
  const SECRET = secretPlaceholder(target);
  const host = info.endpoint.replace(/^https?:\/\//, '');
  const dest = bucket ? `s3://${bucket}/${prefix ?? ''}` : 's3://<bucket>/';
  return [
    '# ~/.s3cfg',
    `host_base = ${host}`,
    `host_bucket = ${host}`,
    `access_key = ${info.access_key}`,
    `secret_key = ${SECRET}`,
    `use_https = ${info.endpoint.startsWith('https') ? 'True' : 'False'}`,
    '',
    '# One file',
    `s3cmd put ./my-file ${dest}`,
    '# A whole folder; the trailing slash uploads its contents, not the folder itself',
    `s3cmd put --recursive ./my-folder/ ${dest}`,
  ].join('\n');
};

const SNIPPETS: Record<ClientId, (target: Target) => string> = {
  aws: awsSnippet,
  rclone: rcloneSnippet,
  s3cmd: s3cmdSnippet,
};

/**
 * How to upload what the browser will not: copy-ready commands for the common S3
 * clients, filled in with this resource's endpoint, region, bucket, folder and
 * access key id. The secret is never put in the page; the commands name where to
 * reveal it, which stays audited.
 */
export const S3ClientInstructionsDialog: FC<{ resolve: Target }> = ({
  resolve,
}) => {
  const [client, setClient] = useState<ClientId>('aws');
  const snippet = SNIPPETS[client](resolve);
  return (
    <ModalDialog
      title={translate('Upload with an S3 client')}
      subtitle={translate(
        'The browser uploads files up to {size}. Larger files, and whole folders, go faster with an S3 client.',
        { size: formatFilesize(resolve.info.max_upload_size, 'B') },
      )}
    >
      <SegmentedControl
        value={client}
        onValueChange={(value) => setClient(value as ClientId)}
        options={[
          { value: 'aws', label: 'AWS CLI' },
          { value: 'rclone', label: 'rclone' },
          { value: 's3cmd', label: 's3cmd' },
        ]}
        className="mb-3"
      />
      <div className="relative">
        <Code className="block whitespace-pre overflow-x-auto p-3 text-xs">
          {snippet}
        </Code>
        <div className="absolute top-2 right-2">
          <CopyToClipboardButton value={snippet} />
        </div>
      </div>
      <FormText className="mt-3">
        {resolve.keysTabHidden
          ? translate(
              'Replace the secret placeholder with the key’s secret, which the service provider hands out for this resource. Buckets are addressed path-style, which every client above supports.',
            )
          : translate(
              'Replace the secret placeholder with the key revealed on the API keys tab. Buckets are addressed path-style, which every client above supports.',
            )}
      </FormText>
    </ModalDialog>
  );
};

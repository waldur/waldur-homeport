import { DownloadSimpleIcon } from '@phosphor-icons/react';

import { ExternalLink } from '@/core/ExternalLink';
import { isEmptyValue } from '@/core/isEmptyValue';
import { Link } from '@/core/Link';
import { FileDownloader } from '@/form/upload/FileDownloader';
import { translate } from '@/i18n';

import { formatProp, FormattedProperty } from './types';

export type Text = string | null | undefined;

export interface UrlFormatOptions {
  /** What the link reads; the URL itself by default. */
  text?: string;
}

/** An address outside the app, opened in a new tab; copies the URL. */
export const formatUrlValue = (
  value: Text,
  options: UrlFormatOptions = {},
): FormattedProperty | null => {
  if (isEmptyValue(value)) {
    return null;
  }
  const text = String(value);
  const node = <ExternalLink url={text} label={options.text ?? text} />;
  return formatProp(node, text);
};

export interface LinkFormatOptions {
  /** The app route the value links to, e.g. `marketplace-orders.details`. */
  state: string;
  params?: Record<string, string>;
}

/** A name that links to its page in the app; the value is the name. */
export const formatLinkValue = (
  value: string | number | null | undefined,
  options: LinkFormatOptions,
): FormattedProperty | null => {
  if (isEmptyValue(value)) {
    return null;
  }
  const text = String(value);
  const node = (
    <Link state={options.state} params={options.params} label={text} />
  );
  return formatProp(node, text);
};

export interface FileFormatOptions {
  /**
   * The name the downloaded file is saved under, or how to name it from its
   * URL (a media URL carries no file name of its own).
   */
  fileName?: string | ((url: string) => string);
  /**
   * What the download link reads, after a download icon ("Download PDF").
   * Without it the row shows just the icon.
   */
  text?: string;
}

/** A file the user can download, as a download button; the value is its URL. */
export const formatFileValue = (
  value: Text,
  options: FileFormatOptions = {},
): FormattedProperty | null => {
  if (isEmptyValue(value)) {
    return null;
  }
  const url = String(value);
  const name =
    typeof options.fileName === 'function'
      ? options.fileName(url)
      : (options.fileName ?? translate('File'));
  const node = options.text ? (
    <FileDownloader
      url={url}
      name={name}
      className="bg-transparent border-0 p-0 m-0 cursor-pointer text-quaternary hover:text-brand inline-flex items-center"
    >
      <DownloadSimpleIcon weight="bold" className="me-1" />
      {options.text}
    </FileDownloader>
  ) : (
    <FileDownloader url={url} name={name} />
  );
  return formatProp(node, url);
};

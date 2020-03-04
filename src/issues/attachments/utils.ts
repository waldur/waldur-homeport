import accept from 'attr-accept';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

export const validateFiles = (
  files: File[] = [],
  excludedTypes: string | string[],
): { accepted: File[]; rejected: File[] } => {
  const rejected = [];
  const accepted = [];

  for (const file of files) {
    const isRejected =
      excludedTypes &&
      excludedTypes.length &&
      accept(
        {
          name: file.name,
          type: file.type,
        },
        excludedTypes,
      );

    isRejected ? rejected.push(file) : accepted.push(file);
  }

  return {
    rejected,
    accepted,
  };
};

export const getErrorMessage = (files: File[]): string => {
  const fileMessage = translate('File');
  const filesMessage = translate('Files');
  const reasonMessage = translate('Restricted, because of type.');
  let fileList = '';

  if (files.length > 1) {
    for (let i = 0; i < files.length; i++) {
      if (i < files.length - 1) {
        fileList += `${files[i].name}, `;
      } else {
        fileList += `${files[i].name}.`;
      }
    }
  } else {
    fileList = `${files[0].name}.`;
  }

  return `${
    files.length > 1 ? filesMessage : fileMessage
  }: ${fileList} \n ${reasonMessage}`;
};

export const openAttachmentModal = (url: string) =>
  openModalDialog('IssueAttachmentModal', { resolve: { url } });

export const getFileName = (url: string): string =>
  url.slice(url.lastIndexOf('/') + 1);

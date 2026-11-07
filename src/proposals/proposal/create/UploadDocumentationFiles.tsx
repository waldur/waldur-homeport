import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  proposalProposalsDetachDocuments,
  ProposalDocumentation,
} from 'waldur-js-client';

import { ACCEPTED_FILE_TYPES } from '@/core/constants';
import { UploadContainer } from '@/form/upload/UploadContainer';
import { translate } from '@/i18n';
import { useConfirmApplicantChange } from '@/proposals/proposal/actingForApplicant';
import { useNotify } from '@/store/notify';

import { DocumentationFiles, sameFile } from './DocumentationFiles';

export const UploadDocumentationFiles = (props) => {
  const { showErrorResponse, showInfo, showSuccess } = useNotify();

  const handleDrop = (newFiles: File[]) => {
    const existingFiles: File[] = props.input.value
      ? Array.from(props.input.value as FileList)
      : [];
    // A file dropped twice is listed once; the backend refuses a second copy
    // of a stored one by content, which this cannot see before the upload.
    const combinedFiles = [...existingFiles];
    newFiles.forEach((file) => {
      if (combinedFiles.some((pending) => sameFile(pending, file))) {
        showInfo(
          translate('{file} is already in the list.', { file: file.name }),
        );
      } else {
        combinedFiles.push(file);
      }
    });
    props.input.onChange(combinedFiles);
  };

  const { mutate: deleteDocument } = useMutation({
    mutationFn: async (docUuid: string) => {
      await proposalProposalsDetachDocuments({
        path: { uuid: props.proposal.uuid },
        body: { documents: [docUuid] },
      });
    },
    onSuccess: () => {
      showSuccess(translate('Document removed successfully'));
      if (props.refetch) {
        props.refetch();
      }
    },
    onError: (error: any) => {
      showErrorResponse(error, translate('Failed to remove document'));
    },
  });

  const confirmChange = useConfirmApplicantChange(props.proposal);
  const handleDeleteExisting = useCallback(
    async (file: ProposalDocumentation) => {
      const confirmed = await confirmChange(
        translate('Remove {file} from the proposal.', {
          file: file.file_name,
        }),
      );
      if (confirmed) deleteDocument(file.uuid);
    },
    [confirmChange, deleteDocument],
  );

  return (
    <>
      <UploadContainer
        onDrop={handleDrop}
        message={translate('PDF, PNG/JPG/JPEG, DOC/DOCX/ODT (max. 25 MB)')}
        multiple={true}
        maxSize={25 * 1024 * 1024} // 25MB
        accept={ACCEPTED_FILE_TYPES}
      />

      <DocumentationFiles
        files={props.proposal.supporting_documentation}
        pending={props.input.value}
        onChange={props.input.onChange}
        onDeleteExisting={handleDeleteExisting}
      />
    </>
  );
};

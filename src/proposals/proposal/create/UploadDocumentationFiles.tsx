import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  proposalProposalsDetachDocuments,
  ProposalDocumentation,
} from 'waldur-js-client';

import { ACCEPTED_FILE_TYPES } from '@/core/constants';
import { UploadContainer } from '@/form/upload/UploadContainer';
import { translate } from '@/i18n';
import { showErrorResponse, showSuccess } from '@/store/notify';

import { DocumentationFiles } from './DocumentationFiles';

export const UploadDocumentationFiles = (props) => {
  const dispatch = useDispatch();

  const handleDrop = (newFiles: File[]) => {
    // Combine existing pending files with new files
    const existingFiles = props.input.value
      ? Array.from(props.input.value as FileList)
      : [];
    const combinedFiles = [...existingFiles, ...newFiles];
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
      dispatch(showSuccess(translate('Document removed successfully')));
      if (props.refetch) {
        props.refetch();
      }
    },
    onError: (error: any) => {
      dispatch(
        showErrorResponse(error, translate('Failed to remove document')),
      );
    },
  });

  const handleDeleteExisting = useCallback(
    (file: ProposalDocumentation) => {
      deleteDocument(file.uuid);
    },
    [deleteDocument],
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

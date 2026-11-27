import { useMutation } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import {
  proposalProposalsDetachDocuments,
  ProposalDocumentation,
} from 'waldur-js-client';

import { ACCEPTED_FILE_TYPES } from '@/core/constants';
import { UploadContainer } from '@/form/upload/UploadContainer';
import { translate } from '@/i18n';
import { useConfirmApplicantChange } from '@/proposals/proposal/actingForApplicant';
import { useNotify } from '@/store/notify';

import { DocumentationFiles } from './DocumentationFiles';
import { screenNewFiles } from './documentDuplicates';

export const UploadDocumentationFiles = (props) => {
  const { showErrorResponse, showError, showSuccess } = useNotify();
  // Hashing takes a moment: the files are added to the list as it stands
  // then, not as it stood when they were dropped.
  const pendingRef = useRef<FileList | File[] | undefined>(undefined);
  pendingRef.current = props.input.value || undefined;
  const pending = () =>
    pendingRef.current ? Array.from(pendingRef.current) : [];

  // A file already on the proposal, attached or pending, is refused at once
  // and by content, whatever its name: the backend would refuse it at save.
  // Drops are screened one after another, and each updates the list at once,
  // so a second drop sees the first one's files before the form re-renders.
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const screenDrop = async (newFiles: File[]) => {
    const { accepted, refused } = await screenNewFiles(
      newFiles,
      pending(),
      props.proposal.supporting_documentation ?? [],
    );
    if (refused.length) showError(refused.join(' '));
    if (accepted.length) {
      const next = [...pending(), ...accepted];
      pendingRef.current = next;
      props.input.onChange(next);
    }
  };
  const handleDrop = (newFiles: File[]) => {
    queueRef.current = queueRef.current
      .then(() => screenDrop(newFiles))
      .catch(() => undefined);
    return queueRef.current;
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

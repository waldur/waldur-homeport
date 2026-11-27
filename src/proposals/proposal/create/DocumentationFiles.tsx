import { ProposalDocumentation } from 'waldur-js-client';

import { AttachmentItem } from '@/form/upload/AttachmentItem';
import { AttachmentItemPending } from '@/form/upload/AttachmentItemPending';
import { AttachmentsList } from '@/form/upload/AttachmentsList';

import { documentDisplayName, sameFile } from './documentDuplicates';

interface DocumentationFilesProps {
  files: Array<ProposalDocumentation>;
  pending?: FileList | File[];
  onChange?(value): void;
  onDeleteExisting?(file: ProposalDocumentation): void;
}

const pendingFileKey = (file: File) =>
  `${file.name}:${file.size}:${file.lastModified}`;

export const DocumentationFiles = (props: DocumentationFilesProps) => {
  const pendingFiles = props.pending ? Array.from(props.pending) : [];

  return props.files?.length > 0 || pendingFiles.length > 0 ? (
    <AttachmentsList
      attachments={
        props.files &&
        (props.files.map((file) => ({
          key: file.file,
          ...file,
          file_name: documentDisplayName(file.file_name),
        })) as any)
      }
      uploading={pendingFiles.map((file) => ({
        key: pendingFileKey(file),
        file,
      }))}
      ItemComponent={
        props.onDeleteExisting
          ? (itemProps) => (
              <AttachmentItem
                {...itemProps}
                onDelete={() => props.onDeleteExisting(itemProps.attachment)}
              />
            )
          : undefined
      }
      ItemPendingComponent={(itemProps) => (
        <AttachmentItemPending
          {...itemProps}
          onCancel={(f) =>
            props.onChange(pendingFiles.filter((file) => !sameFile(file, f)))
          }
        />
      )}
      className="mb-2.5"
    />
  ) : null;
};

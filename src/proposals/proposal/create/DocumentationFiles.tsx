import { ProposalDocumentation } from 'waldur-js-client';

import { AttachmentItem } from '@/form/upload/AttachmentItem';
import { AttachmentItemPending } from '@/form/upload/AttachmentItemPending';
import { AttachmentsList } from '@/form/upload/AttachmentsList';

interface DocumentationFilesProps {
  files: Array<ProposalDocumentation>;
  pending?: FileList | File[];
  onChange?(value): void;
  onDeleteExisting?(file: ProposalDocumentation): void;
}

/**
 * What counts as the same pending file, before anything is uploaded: the
 * browser gives no content hash, so name, size and modification time stand
 * in. Used to list a file once and to cancel the one the applicant means.
 */
export const sameFile = (a: File, b: File) =>
  a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

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
          // Extract the file name from a given file path
          file_name: file.file_name
            .split('/')
            .pop()
            .replace(/_[^_]+\./, '.'),
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

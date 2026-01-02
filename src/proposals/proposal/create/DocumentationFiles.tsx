import { ProposalDocumentation } from 'waldur-js-client';

import { AttachmentItem } from '@waldur/form/upload/AttachmentItem';
import { AttachmentItemPending } from '@waldur/form/upload/AttachmentItemPending';
import { AttachmentsList } from '@waldur/form/upload/AttachmentsList';

interface DocumentationFilesProps {
  files: Array<ProposalDocumentation>;
  pending?: FileList | File[];
  onChange?(value): void;
  onDeleteExisting?(file: ProposalDocumentation): void;
}

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
        key: file.size,
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
            props.onChange(
              pendingFiles.filter(
                (file) => file.name !== f.name || file.size !== f.size,
              ),
            )
          }
        />
      )}
      className="mb-3"
    />
  ) : null;
};

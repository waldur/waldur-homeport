import { FC, useState } from 'react';

import { BaseButton, FormField, FormLabel, FormText, Input } from 'waldur-ui';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { S3Source } from './s3Source';

// S3's rules: 3-63 lower-case letters, digits, dots and hyphens, starting and
// ending with a letter or digit. Checked here so the common typo never makes a
// round trip; the server checks again.
const BUCKET_NAME = /^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/;

export const CreateBucketDialog: FC<{
  resolve: { source: S3Source; onCreated: (bucket: string) => void };
}> = ({ resolve }) => {
  const { closeDialog } = useModal();
  const [name, setName] = useState('');
  const valid = BUCKET_NAME.test(name) && !name.includes('..');
  const { mutate, isPending } = useManagedMutation({
    mutationFn: () => resolve.source.createBucket(name),
    successMessage: translate('Bucket {name} created.', { name }),
    errorMessage: translate('Unable to create the bucket.'),
    onSuccess: () => {
      closeDialog();
      resolve.onCreated(name);
    },
  });
  return (
    <ModalDialog
      title={translate('Create bucket')}
      footer={
        <BaseButton
          variant="primary"
          size="lg"
          label={translate('Create')}
          pending={isPending}
          disabled={!valid}
          disabledReason={translate(
            'Use 3-63 lower-case letters, digits, dots or hyphens.',
          )}
          onClick={() => mutate(undefined)}
        />
      }
    >
      <FormField controlId="s3-bucket-name">
        <FormLabel>{translate('Bucket name')}</FormLabel>
        <Input
          id="s3-bucket-name"
          value={name}
          autoFocus
          invalid={Boolean(name) && !valid}
          onChange={(event) => setName(event.target.value.trim())}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && valid) mutate(undefined);
          }}
        />
        <FormText>
          {translate(
            'Bucket names are shared by every user of the storage service, so a common name may already be taken.',
          )}
        </FormText>
      </FormField>
    </ModalDialog>
  );
};

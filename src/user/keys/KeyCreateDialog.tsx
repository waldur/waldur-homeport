import { InfoIcon } from '@phosphor-icons/react';
import React, { useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { Form } from 'react-final-form';
import { keysCreate, SshKeyRequest } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { FeaturedIcon } from '@/core/FeaturedIcon';
import { required } from '@/core/validators';
import { StringGroup, TextGroup } from '@/form';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import * as constants from './constants';

const extractNameFromKey = (publicKey: string) => {
  if (publicKey) {
    const key = publicKey.split(' ');
    if (key.length === 3 && key[2]) {
      return key[2].trim();
    }
  }
  return '';
};

interface KeyCreateDialogProps {
  refetch?: () => void;
}

const SshKeyRestrictionsBanner = () => {
  const allowedTypes = ENV.plugins.WALDUR_CORE.SSH_KEY_ALLOWED_TYPES || [];
  const minRsaKeySize = ENV.plugins.WALDUR_CORE.SSH_KEY_MIN_RSA_KEY_SIZE || 0;

  const showMinRsa = useMemo(
    () =>
      minRsaKeySize > 0 &&
      (allowedTypes.length === 0 || allowedTypes.includes('ssh-rsa')),
    [allowedTypes, minRsaKeySize],
  );

  if (allowedTypes.length === 0 && minRsaKeySize <= 0) {
    return null;
  }

  return (
    <Card className="card-bordered bg-light-info mb-4">
      <Card.Body className="d-flex align-items-center gap-3 p-4">
        {/* eslint-disable-next-line waldur-custom/enforce-phosphor-icon-weight */}
        <FeaturedIcon IconComponent={InfoIcon} variant="info" />
        <div>
          {allowedTypes.length > 0 && (
            <div>
              {translate('Allowed key types: {types}', {
                types: allowedTypes.join(', '),
              })}
            </div>
          )}
          {showMinRsa && (
            <div>
              {translate('Minimum RSA key size: {size} bits', {
                size: minRsaKeySize,
              })}
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export const KeyCreateDialog: React.FC<KeyCreateDialogProps> = ({
  refetch,
}) => {
  const createKeyMutation = useManagedMutation<any, any, SshKeyRequest>({
    mutationFn: async (values) => {
      let data = { ...values };
      if (!values.name) {
        const name = extractNameFromKey(values.public_key);
        data = { ...values, name };
      }
      const response = await keysCreate({ body: data });
      return response.data;
    },
    successMessage: translate('The key has been created.'),
    errorMessage: translate('Unable to create key.'),
    refetch,
    invalidateQueries: [{ queryKey: ['table', constants.keysListTable] }],
  });

  return (
    <Form<SshKeyRequest>
      onSubmit={(values) => createKeyMutation.mutateAsync(values)}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Import public key')}
            footer={
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
                label={translate('Import key')}
                className="btn btn-primary"
              />
            }
          >
            <div className="size-lg">
              <SshKeyRestrictionsBanner />
              <StringGroup
                name="name"
                placeholder={translate('e.g. my-ssh-key')}
                label={translate('Key name')}
              />
              <TextGroup
                name="public_key"
                validate={required}
                style={{ height: 100 }}
                placeholder={translate('Paste your SSH public key here...')}
                label={translate('Public key')}
                required
              />
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};

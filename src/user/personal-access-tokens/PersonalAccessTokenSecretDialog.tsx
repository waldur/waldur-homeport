import {
  EyeIcon,
  EyeSlashIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { Card, Form } from 'react-bootstrap';

import { ENV } from '@/core/config';
import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { FeaturedIcon } from '@/core/FeaturedIcon';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

interface PersonalAccessTokenSecretDialogProps {
  resolve: {
    token: string;
    tokenName: string;
  };
}

export const PersonalAccessTokenSecretDialog: FunctionComponent<
  PersonalAccessTokenSecretDialogProps
> = ({ resolve: { token, tokenName } }) => {
  const [showSecret, setShowSecret] = useState(false);
  const toggleSecret = useCallback(() => setShowSecret((prev) => !prev), []);

  const maskedToken = useMemo(
    () => token.slice(0, 10) + '•'.repeat(token.length - 10),
    [token],
  );

  const curlExample = useMemo(
    () =>
      `curl -H "Authorization: Bearer ${token}" ${ENV.apiEndpoint}api/customers/`,
    [token],
  );

  const maskedCurlExample = useMemo(
    () =>
      `curl -H "Authorization: Bearer ${maskedToken}" ${ENV.apiEndpoint}api/customers/`,
    [maskedToken],
  );

  return (
    <ModalDialog
      title={translate('Personal access token created')}
      footer={<CloseDialogButton label={translate('Done')} />}
    >
      <Card className="card-bordered bg-light-warning mb-4">
        <Card.Body className="d-flex align-items-center gap-3 p-4">
          {/* eslint-disable-next-line waldur-custom/enforce-phosphor-icon-weight */}
          <FeaturedIcon IconComponent={WarningCircleIcon} variant="warning" />
          <div>
            <div className="fw-bold">
              {translate(
                'Make sure to copy your personal access token now. You will not be able to see it again.',
              )}
            </div>
          </div>
        </Card.Body>
      </Card>

      <div className="mb-3">
        <Form.Label className="fw-bold">{translate('Token name')}</Form.Label>
        <div>{tokenName}</div>
      </div>

      <div className="mb-3">
        <Form.Label className="fw-bold">{translate('Your token')}</Form.Label>
        <div className="d-flex align-items-center gap-2 p-3 bg-light rounded">
          <button
            className="text-btn flex-shrink-0"
            type="button"
            onClick={toggleSecret}
          >
            {showSecret ? (
              <EyeSlashIcon size={20} weight="bold" />
            ) : (
              <EyeIcon size={20} weight="bold" />
            )}
          </button>
          <code className="flex-grow-1 text-break">
            {showSecret ? token : maskedToken}
          </code>
          <CopyToClipboardButton value={token} />
        </div>
      </div>

      <div>
        <Form.Label className="fw-bold">
          {translate('Example usage')}
        </Form.Label>
        <div className="d-flex align-items-start gap-2 p-3 bg-light rounded">
          <code className="flex-grow-1 text-break">
            {showSecret ? curlExample : maskedCurlExample}
          </code>
          <CopyToClipboardButton value={curlExample} />
        </div>
      </div>
    </ModalDialog>
  );
};

import { CaretDownIcon, CaretUpIcon } from '@phosphor-icons/react';
import { FC, ReactNode, useState } from 'react';
import { Card, Collapse } from 'react-bootstrap';
import { Offering, Resource } from 'waldur-js-client';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { translate } from '@/i18n';
import { SecretField } from '@/marketplace/common/SecretField';
import { NoResult } from '@/navigation/header/search/NoResult';

import {
  getInferenceApiKey,
  getInferenceEndpoint,
  isInferenceServiceEnabled,
} from '../../inference';
import { InferencePlayground } from '../../playground/InferencePlayground';
import { ModelSelect } from '../../playground/ModelSelect';
import {
  InferenceModelState,
  useInferenceModels,
} from '../../playground/useInferenceModels';

// Stacked label/value row — clearer than a two-column Field in the narrow 1/3
// credentials column.
const CredentialRow: FC<{ label: string; children: ReactNode }> = ({
  label,
  children,
}) => (
  <div className="mb-5">
    <div className="text-gray-600 fs-7 mb-1">{label}</div>
    <div className="fw-bold">{children}</div>
  </div>
);

const EndpointCard: FC<{ endpoint: string; apiKey: string | null }> = ({
  endpoint,
  apiKey,
}) => (
  <Card className="card-bordered">
    <Card.Header>
      <Card.Title>
        <h3>{translate('Endpoint')}</h3>
      </Card.Title>
    </Card.Header>
    <Card.Body>
      <CredentialRow label={translate('Endpoint')}>
        <div className="d-flex align-items-center gap-1">
          <span className="text-break">{endpoint}</span>
          <CopyToClipboardButton value={endpoint} />
        </div>
      </CredentialRow>

      <CredentialRow label={translate('API key')}>
        {apiKey ? (
          <SecretField value={apiKey} />
        ) : (
          <span className="text-muted fw-normal">
            {translate('Not assigned')}
          </span>
        )}
      </CredentialRow>

      <CredentialRow label={translate('Auth')}>
        {translate('Bearer · API key')}
      </CredentialRow>

      <CredentialRow label={translate('Compatibility')}>
        {translate('OpenAI v1')}
      </CredentialRow>
    </Card.Body>
  </Card>
);

// Collapsed by default — just the title and a caret. The playground body only
// mounts once opened, so the tab stays compact until the user asks to try the
// model.
const PlaygroundCard: FC<{
  endpoint: string;
  apiKey: string | null;
  modelState: InferenceModelState;
}> = ({ endpoint, apiKey, modelState }) => {
  const [open, setOpen] = useState(false);
  return (
    <Card className="card-bordered">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <Card.Title>
          <h3>{translate('Playground')}</h3>
        </Card.Title>
        <div className="d-flex align-items-center gap-2">
          {open && (
            <ModelSelect
              models={modelState.models}
              model={modelState.model}
              error={modelState.error}
              onChange={modelState.setModel}
            />
          )}
          <button
            type="button"
            className="btn btn-tertiary btn-sm"
            aria-label={
              open
                ? translate('Collapse playground')
                : translate('Open playground')
            }
            onClick={() => setOpen((value) => !value)}
          >
            {open ? (
              <CaretUpIcon weight="bold" size={16} />
            ) : (
              <CaretDownIcon weight="bold" size={16} />
            )}
          </button>
        </div>
      </Card.Header>
      <Collapse in={open} mountOnEnter unmountOnExit>
        <div>
          <Card.Body>
            <InferencePlayground
              endpoint={endpoint}
              model={modelState.model}
              apiKey={apiKey}
              error={modelState.error}
              height="55vh"
            />
          </Card.Body>
        </div>
      </Collapse>
    </Card>
  );
};

// Inference service view: endpoint + credentials on the left third, an inline
// playground on the right two-thirds. Gated on the "Enable inference service
// view" offering flag. The endpoint/API key are read-only here — providers
// manage them from the resource's provider actions.
export const InferenceServiceView = ({
  resource,
  offering,
}: {
  resource: Resource;
  offering: Offering;
}) => {
  const endpoint = getInferenceEndpoint(resource, offering);
  const apiKey = getInferenceApiKey(resource);
  const modelState = useInferenceModels(endpoint, apiKey);

  if (!isInferenceServiceEnabled(resource)) {
    return null;
  }
  // No endpoint → the whole tab is the error; the credential/playground cards
  // would be empty and useless.
  if (!endpoint) {
    return (
      <NoResult
        noAction
        title={translate('No inference endpoint')}
        message={translate(
          'No OpenAI-compatible endpoint has been reported for this resource yet. If it was just created it may still be provisioning — otherwise contact the provider.',
        )}
      />
    );
  }
  return (
    <div className="row">
      <div className="col-lg-5 mb-6">
        <EndpointCard endpoint={endpoint} apiKey={apiKey} />
      </div>
      <div className="col-lg-7 mb-6">
        <PlaygroundCard
          endpoint={endpoint}
          apiKey={apiKey}
          modelState={modelState}
        />
      </div>
    </div>
  );
};

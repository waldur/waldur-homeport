import { CaretDownIcon, CaretUpIcon } from '@phosphor-icons/react';
import { FC, ReactNode, useState } from 'react';
import { Card, Collapse } from 'react-bootstrap';
import { Offering, Resource, ResourceApiKeyStatus } from 'waldur-js-client';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

import {
  getInferenceEndpoint,
  isInferenceServiceEnabled,
} from '../../inference';
import { InferencePlayground } from '../../playground/InferencePlayground';
import { ModelSelect } from '../../playground/ModelSelect';
import {
  InferenceModelState,
  useInferenceModels,
} from '../../playground/useInferenceModels';
import {
  useResourceApiKeysTable,
  useRevealedApiKey,
} from '../api-keys/useResourceApiKeys';

const CredentialRow: FC<{ label: string; children: ReactNode }> = ({
  label,
  children,
}) => (
  <div className="mb-5">
    <div className="text-gray-600 fs-7 mb-1">{label}</div>
    <div className="fw-bold">{children}</div>
  </div>
);

const EndpointCard: FC<{ endpoint: string }> = ({ endpoint }) => (
  <Card className="card-bordered mb-6">
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
      <CredentialRow label={translate('Auth')}>
        {translate('Bearer · API key')}
      </CredentialRow>
      <CredentialRow label={translate('Compatibility')}>
        {translate('OpenAI v1')}
      </CredentialRow>
    </Card.Body>
  </Card>
);

// The playground authenticates with the first active key, revealed on open.
const PlaygroundCard: FC<{
  endpoint: string;
  activeKey?: ResourceApiKeyStatus;
  modelState: InferenceModelState;
  playgroundKey: ReturnType<typeof useRevealedApiKey>;
}> = ({ endpoint, activeKey, modelState, playgroundKey }) => {
  const [open, setOpen] = useState(false);
  const toggle = () => {
    if (!open && activeKey && !playgroundKey.value) playgroundKey.reveal();
    setOpen((value) => !value);
  };
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
            onClick={toggle}
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
              apiKey={playgroundKey.value}
              error={modelState.error}
              height="55vh"
            />
          </Card.Body>
        </div>
      </Collapse>
    </Card>
  );
};

// Inference service view: the OpenAI-compatible endpoint on the left third, an
// inline playground on the right two-thirds. Gated on the "Enable inference
// service view" offering flag. The keys themselves live in the resource's
// "API keys" tab — one home for every backend that exposes them.
export const InferenceServiceView = ({
  resource,
  offering,
}: {
  resource: Resource;
  offering: Offering;
}) => {
  const endpoint = getInferenceEndpoint(resource, offering);
  // The keys themselves are managed in the resource's "API keys" tab; here they
  // are only needed to pick the key the playground authenticates with.
  const { rows } = useResourceApiKeysTable(resource);
  const activeKey = (rows as ResourceApiKeyStatus[] | undefined)?.find(
    (key) => key.state === 'OK',
  );
  const playgroundKey = useRevealedApiKey(activeKey?.uuid ?? '');
  const modelState = useInferenceModels(endpoint, playgroundKey.value);

  if (!isInferenceServiceEnabled(resource)) {
    return null;
  }
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
        <EndpointCard endpoint={endpoint} />
      </div>
      <div className="col-lg-7 mb-6">
        <PlaygroundCard
          endpoint={endpoint}
          activeKey={activeKey}
          modelState={modelState}
          playgroundKey={playgroundKey}
        />
      </div>
    </div>
  );
};

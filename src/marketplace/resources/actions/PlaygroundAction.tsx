import { ChatCircleDotsIcon } from '@phosphor-icons/react';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionItemType } from '@/resource/actions/types';

import { InferencePlaygroundDialog } from '../playground/InferencePlaygroundDialog';

// The OpenAI-compatible base URL the playground connects to: a resource access
// endpoint whose URL ends in `/v1`.
const getInferenceEndpoint = (resource: any): string | null => {
  const match = (resource?.endpoints ?? []).find(
    (endpoint: any) =>
      typeof endpoint?.url === 'string' &&
      endpoint.url.replace(/\/+$/, '').endsWith('/v1'),
  );
  return match ? match.url.replace(/\/+$/, '') : null;
};

export const PlaygroundAction: ActionItemType = ({ resource }) => {
  const { openDialog } = useModal();

  // Visibility is an explicit offering opt-in ("Expose inference playground");
  // the endpoint is still required as the chat target (and a safety guard if
  // the resource has not reported one yet).
  const exposed = (resource.offering_plugin_options as any)
    ?.expose_inference_playground;
  const endpoint = getInferenceEndpoint(resource);
  if (!exposed || !endpoint) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Playground')}
      iconNode={<ChatCircleDotsIcon weight="bold" />}
      action={() =>
        openDialog(InferencePlaygroundDialog, {
          resolve: { endpoint, resourceName: resource.name },
          size: 'lg',
        })
      }
    />
  );
};

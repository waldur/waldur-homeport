import { useQuery } from '@tanstack/react-query';
import { FC, useMemo, useState } from 'react';
import {
  providerCannedResponsesList,
  providerCannedResponsesRender,
} from 'waldur-js-client';

import { FormGroup } from '@/form';
import { Select } from '@/form/select';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';

interface CannedResponseOption {
  value: string;
  label: string;
}

interface CannedResponseSelectorProps {
  helpdeskUuid: string;
  /** Template variables passed to the backend renderer (e.g. issue fields). */
  context?: Record<string, unknown>;
  /** Called with the rendered text when a response is picked. */
  onInsert: (text: string) => void;
}

/**
 * Dropdown that lets a provider agent insert one of the helpdesk's canned
 * responses into a reply. The selected response is rendered server-side (Django
 * template substitution over `context`) and the resulting text handed to
 * `onInsert`. Renders nothing when the helpdesk has no canned responses.
 */
export const CannedResponseSelector: FC<CannedResponseSelectorProps> = ({
  helpdeskUuid,
  context,
  onInsert,
}) => {
  const [rendering, setRendering] = useState(false);
  const { showErrorResponse } = useNotify();

  const { data: responses = [] } = useQuery({
    queryKey: ['ProviderCannedResponses', helpdeskUuid],
    queryFn: () =>
      providerCannedResponsesList({
        query: { provider_helpdesk_uuid: helpdeskUuid, page_size: 100 },
      }).then((response) => response.data ?? []),
    enabled: Boolean(helpdeskUuid),
  });

  const options = useMemo<CannedResponseOption[]>(
    () =>
      responses.map((response) => ({
        value: response.uuid,
        label: response.name,
      })),
    [responses],
  );

  if (!responses.length) {
    return null;
  }

  const handlePick = async (uuid: string) => {
    if (!uuid) {
      return;
    }
    setRendering(true);
    try {
      const response = await providerCannedResponsesRender({
        path: { uuid },
        body: { context: context ?? {} },
      });
      const text = response.data?.rendered_text;
      if (text) {
        onInsert(text);
      }
    } catch (error) {
      showErrorResponse(error, translate('Unable to render canned response.'));
    } finally {
      setRendering(false);
    }
  };

  return (
    <FormGroup label={translate('Canned response')}>
      <Select
        // Held at null rather than at the picked option so the control falls
        // back to the placeholder after each pick, letting the same response be
        // inserted again.
        value={null}
        options={options}
        isDisabled={rendering}
        isLoading={rendering}
        placeholder={translate('Insert a canned response…')}
        onChange={(option: CannedResponseOption | null) =>
          option && handlePick(option.value)
        }
      />
    </FormGroup>
  );
};

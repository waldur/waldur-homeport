import { useQuery } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { Form } from 'react-bootstrap';
import {
  providerCannedResponsesList,
  providerCannedResponsesRender,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';

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
    <Form.Group className="mb-3">
      <Form.Label className="text-muted fs-7">
        {translate('Canned response')}
      </Form.Label>
      <Form.Select
        // Reset to the placeholder after each pick so the same response can be
        // inserted again.
        value=""
        disabled={rendering}
        onChange={(event) => handlePick(event.target.value)}
      >
        <option value="">{translate('Insert a canned response…')}</option>
        {responses.map((response) => (
          <option key={response.uuid} value={response.uuid}>
            {response.name}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );
};

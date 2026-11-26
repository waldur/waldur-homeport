import { Fragment } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from 'waldur-ui';

import { SafeMarkdown } from '@/core/SafeMarkdown';
import { translate } from '@/i18n';

import { Call } from '../types';

import { CallDetailsFields } from './CallDetailsFields';

/** `<CallDetailsFields></CallDetailsFields>` or `<CallDetailsFields />`. */
const DETAILS_PLACEHOLDER =
  /<CallDetailsFields\s*(?:\/>|>\s*<\/CallDetailsFields>)/i;

interface CallDescriptionCardProps {
  call: Call;
}

/**
 * The description is authored by call managers and shown on a public page, so
 * it goes through the shared sanitizer: raw HTML keeps only allowlisted tags
 * and attributes, never class or style. The details placeholder is split out
 * and rendered as a component between the sanitized parts.
 */
export const CallDescriptionCard = ({ call }: CallDescriptionCardProps) => {
  const parts = (call.description || '').split(DETAILS_PLACEHOLDER);
  const showDetailsOnly = !call.description;

  return (
    <Card bordered>
      <CardHeader>
        <CardTitle as="div">
          <h3>{translate('Description')}</h3>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showDetailsOnly ? (
          <CallDetailsFields call={call} />
        ) : (
          parts.map((part, index) => (
            <Fragment key={index}>
              {index > 0 && <CallDetailsFields call={call} />}
              {part.trim() && <SafeMarkdown text={part} />}
            </Fragment>
          ))
        )}
      </CardContent>
    </Card>
  );
};

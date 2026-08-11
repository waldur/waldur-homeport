import { Fragment, ReactNode } from 'react';

import { LanguageUtilsService } from './languageUtils';
import { MessageTransform, Translate } from './types';

export const formatJsxTemplate = (template, context) => {
  if (!context) {
    return template;
  }
  return (
    <Fragment>
      {template.split(/\{|\}/g).map((part, index) => (
        <Fragment key={index}>
          {index % 2 === 0 ? part : context[part]}
        </Fragment>
      ))}
    </Fragment>
  );
};

export const formatJsx = (
  template: string,
  context: Record<string, (s: string) => ReactNode>,
) => {
  const pattern = /<([^>]+)>([^<]*)<\/([^>]+)>/g;
  const parts = [];
  let matches,
    prevIndex = 0;
  while ((matches = pattern.exec(template)) !== null) {
    parts.push(template.substring(prevIndex, matches.index));
    parts.push(context[matches[1]](matches[2]));
    prevIndex = matches[0].length + matches.index;
  }
  if (prevIndex !== template.length) {
    parts.push(template.substring(prevIndex));
  }
  return (
    <Fragment>
      {parts.map((part, index) => (
        <Fragment key={index}>{part}</Fragment>
      ))}
    </Fragment>
  );
};

export const formatTemplate: Translate = (template, context) =>
  context ? template.replace(/{(.+?)}/g, (_, key) => context[key]) : template;

const translateTemplate = (template: string) =>
  LanguageUtilsService.dictionary[template] || template;

let messageTransform: MessageTransform = (message) => message;

/**
 * Installs a host app's message-transform hook (e.g. deployment-specific
 * terminology overrides), run before dictionary lookup on every `translate`
 * call. Call once during bootstrap; defaults to identity.
 */
export function setMessageTransform(transform: MessageTransform) {
  messageTransform = transform;
}

export const translate: Translate = (
  template,
  context,
  interpolator = formatTemplate,
) => interpolator(translateTemplate(messageTransform(template)), context);

import { FC, useMemo } from 'react';
import { NotificationPreview } from 'waldur-js-client';

import { Card, PropertyItem, PropertyList, Tabs } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { useTheme } from '@/theme/useTheme';

import { sourceLabel } from './labels';

/** The preview's height and inset, the same for its HTML and its text. */
const PREVIEW_HEIGHT = 320;
const PREVIEW_PADDING = 16;

/**
 * The mail's HTML with the page's look underneath: a mail without styles of
 * its own would otherwise show as a bare white page in serif type, glaring
 * in dark mode. Its own styles still win: they come after these.
 */
const useFramedHtml = (html: string) => {
  const { theme } = useTheme();
  return useMemo(() => {
    const page = getComputedStyle(document.body);
    // The size of the app's text-sm, which the text view is set in.
    const probe = document.createElement('span');
    probe.className = 'text-sm';
    document.body.appendChild(probe);
    const { fontSize, lineHeight } = getComputedStyle(probe);
    probe.remove();
    const textSm = { fontSize, lineHeight };
    // A card's white, not the page's grey: the mail reads as on a card.
    const cardBg =
      getComputedStyle(document.documentElement)
        .getPropertyValue('--card-bg')
        .trim() || page.backgroundColor;
    // The app's link colour in the current theme: the frame sees none of
    // the page's tokens.
    const linkColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue('--text-brand-secondary')
        .trim() || page.color;
    const dark = theme === 'dark';
    const base = `<style>
      :root { color-scheme: ${dark ? 'dark' : 'light'}; }
      body {
        margin: 0;
        padding: ${PREVIEW_PADDING}px;
        font-family: ${page.fontFamily || 'system-ui, sans-serif'};
        font-size: ${textSm.fontSize};
        line-height: ${textSm.lineHeight};
        background: ${cardBg};
        color: ${page.color};
        overflow-wrap: anywhere;
      }
      /* Starts where the text view does: no browser margin above. */
      body > :first-child { margin-top: 0; }
      body > :last-child { margin-bottom: 0; }
      a { color: ${linkColor}; }
    </style>`;
    return base + html;
  }, [html, theme]);
};

/** The label column of the mail's fields, so their values line up. */
const LABEL_WIDTH = '120px';

/**
 * The mail's subject, whose wording it is, and whether it is sent: rows for
 * the caller's list.
 */
const MailFields: FC<{
  mail: Pick<NotificationPreview, 'subject'> &
    Partial<Pick<NotificationPreview, 'source' | 'enabled'>>;
}> = ({ mail }) => (
  <>
    <PropertyItem
      label={translate('Subject')}
      value={<span data-testid="mail-subject">{mail.subject}</span>}
    />
    {mail.source && (
      <PropertyItem
        label={translate('Wording')}
        value={sourceLabel(mail.source)}
      />
    )}
    {mail.enabled === false && (
      <PropertyItem
        label={translate('Sending')}
        value={translate('Switched off on this portal')}
      />
    )}
  </>
);

/**
 * A mail as it would be sent: its subject, whose wording it is, and its body.
 * In tabs, the HTML is shown in a sandboxed frame: no script runs and nothing
 * of the page reaches it; as one row, it is sanitised by FormattedHtml.
 */
export const MailView: FC<{
  mail: Pick<NotificationPreview, 'subject' | 'text' | 'html'> &
    Partial<Pick<NotificationPreview, 'source' | 'enabled'>>;
  /** Leave out the subject and its marks, for a row that shows them already. */
  hideSubject?: boolean;
  /**
   * Only the mail as recipients see it, its HTML, as one more row of its
   * fields: a read-only preview. Left out, the HTML and the text body are
   * tabs, for those who write both.
   */
  htmlOnly?: boolean;
}> = ({ mail, hideSubject, htmlOnly }) => {
  const framedHtml = useFramedHtml(mail.html);
  const htmlFrame = (
    <Card className="overflow-hidden">
      <iframe
        title={mail.subject}
        sandbox=""
        srcDoc={framedHtml}
        className="block w-full border-0"
        style={{ height: PREVIEW_HEIGHT }}
      />
    </Card>
  );
  if (htmlOnly) {
    return (
      <PropertyList
        variant="summary"
        termWidth={LABEL_WIDTH}
        data-testid="mail-view"
      >
        {!hideSubject && <MailFields mail={mail} />}
        {/* A value like the others, in the app's HTML renderer. */}
        <PropertyItem
          label={translate('Body')}
          value={propVal.richText(mail.html, { format: 'html' })}
          hideIfEmpty={false}
          data-testid="mail-body"
        />
      </PropertyList>
    );
  }
  return (
    <div className="flex flex-col gap-2.5" data-testid="mail-view">
      {!hideSubject && (
        <PropertyList variant="summary" termWidth={LABEL_WIDTH}>
          <MailFields mail={mail} />
        </PropertyList>
      )}
      <Tabs
        defaultValue="html"
        listProps={{ className: 'mb-2.5' }}
        items={[
          {
            value: 'html',
            title: translate('HTML'),
            content: htmlFrame,
          },
          {
            value: 'text',
            title: translate('Text'),
            content: (
              <Card>
                <pre
                  className="mb-0 overflow-auto text-sm whitespace-pre-wrap"
                  // The HTML frame's size and inset, so switching between
                  // the two does not move or resize anything.
                  style={{
                    height: PREVIEW_HEIGHT,
                    padding: PREVIEW_PADDING,
                    // The HTML frame's type too (see useFramedHtml).
                    fontFamily: 'inherit',
                  }}
                >
                  {mail.text}
                </pre>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};

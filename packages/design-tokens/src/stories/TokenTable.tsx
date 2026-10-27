import { Fragment, type ReactNode } from 'react';

import { contrastRatio, parseColor, readableOn } from '../contrast';
import { useResolvedVar } from '../react';

import { shortValue, type Token, type TokenFile } from './tokenSource';

/**
 * Monospace text. Not `<Mono>`: Metronic styles that element globally (a
 * filled, shadowed box), which these tables do not want.
 */
export function Mono({
  className = '',
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <span className={`font-mono ${className}`}>{children}</span>;
}

/** Renders `backticked` spans as inline monospace. */
export function Prose({ text }: { text: string }) {
  return (
    <>
      {text.split('`').map((part, i) =>
        i % 2 ? (
          <Mono key={i} className="rounded bg-primary-hover px-1 text-[11px]">
            {part}
          </Mono>
        ) : (
          part
        ),
      )}
    </>
  );
}

/** A docblock: prose paragraphs, and indented ones as an aligned list. */
function Doc({ text }: { text: string }) {
  return (
    <div className="mb-5 max-w-4xl space-y-2 text-xs text-quaternary">
      {text.split('\n\n').map((para, i) =>
        /^\s{2,}/.test(para) ? (
          <Mono key={i} className="block whitespace-pre text-[11px]">
            {para.replace(/^\s{2}/gm, '')}
          </Mono>
        ) : (
          <p key={i}>
            <Prose text={para} />
          </p>
        ),
      )}
    </div>
  );
}

/** Title, the token file's own docblock, then the content. */
export function TokenPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-[var(--page-bg)] p-5">
      <h3 className="mb-1 text-base font-semibold text-primary">{title}</h3>
      {intro && <Doc text={intro} />}
      {children}
    </div>
  );
}

/** A block that does not redeclare the token: it keeps the default (`:root`) value. */
const INHERITS = <span className="text-quinary">inherits</span>;
/** A variable the page does not resolve at all. */
const NOT_SET = <span className="text-danger">not set</span>;

/** Roles drawn on a surface, for which a contrast ratio means something. */
const isForeground = (name: string) =>
  !/on-brand/.test(name) &&
  /^--(text|fg)-|-(text|fg|icon|label)(-|$)|border|focus-ring-color/.test(name);

const isShadow = (name: string) => /shadow/.test(name);
const isLine = (name: string) =>
  /^--(border|divider)|-border|-divider/.test(name);

/** A live preview of the token, chosen by what it holds. */
function Preview({ token, value }: { token: Token; value: string }) {
  const v = `var(${token.name})`;
  if (isShadow(token.name)) {
    return (
      <div
        className="size-10 rounded-md bg-[var(--card-bg)]"
        style={{ boxShadow: v }}
      />
    );
  }
  if (!parseColor(value) && !/rgba?\(|color-mix|#/.test(value)) {
    return <div className="size-10" />;
  }
  if (isLine(token.name)) {
    return (
      <div
        className="size-10 rounded-md bg-[var(--card-bg)]"
        style={{ border: `2px solid ${v}` }}
      />
    );
  }
  return (
    <div
      className="size-10 rounded-md border-[1px] border-secondary"
      style={{ background: v }}
    />
  );
}

/** Text in the token's colour on a surface, with its WCAG ratio. */
function Contrast({ value, surface }: { value: string; surface: string }) {
  const surfaceValue = useResolvedVar(surface);
  if (!parseColor(value) || !parseColor(surfaceValue)) return null;
  const ratio = contrastRatio(value, surfaceValue);
  const tone =
    ratio >= 4.5 ? 'text-success' : ratio >= 3 ? 'text-warning' : 'text-danger';
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="rounded px-1.5 py-0.5 text-sm font-semibold"
        style={{ color: value, background: `var(${surface})` }}
      >
        Aa
      </span>
      <span className={`font-mono text-[11px] ${tone}`}>
        {ratio.toFixed(1)}:1
      </span>
    </div>
  );
}

function Row({
  token,
  blocks,
  utilities,
  contrastOn,
}: {
  token: Token;
  blocks: string[];
  utilities?: Map<string, string[]>;
  contrastOn?: string;
}) {
  const value = useResolvedVar(token.name);
  return (
    <div className="contents">
      <div className="py-1.5">
        <Preview token={token} value={value} />
      </div>
      <div className="min-w-0 py-1.5">
        <Mono className="text-xs font-semibold text-primary">{token.name}</Mono>
        {token.note && (
          <p className="mt-1 max-w-md text-[11px] text-quaternary">
            <Prose text={token.note} />
          </p>
        )}
      </div>
      <div className="py-1.5">
        {(utilities?.get(token.name) ?? []).map((u) => (
          <Mono key={u} className="mr-1 block text-[11px] text-secondary">
            {u}
          </Mono>
        ))}
      </div>
      {blocks.map((block) => (
        <Mono
          key={block}
          className="break-all py-1.5 text-[11px] text-tertiary"
        >
          {token.values[block] ? shortValue(token.values[block]) : INHERITS}
        </Mono>
      ))}
      <div className="py-1.5">
        <Mono
          className="text-[11px] text-quaternary rounded-sm"
          style={
            parseColor(value) && !isShadow(token.name)
              ? {
                  background: value,
                  color: readableOn(value) ?? undefined,
                  padding: '1px 4px',
                }
              : undefined
          }
        >
          {value ? value : NOT_SET}
        </Mono>
      </div>
      {contrastOn && (
        <div className="py-1.5">
          {isForeground(token.name) && (
            <Contrast value={value} surface={contrastOn} />
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Every token of a parsed file (or a filtered part of it): preview, name and
 * note, the Tailwind utility that reads it, the source value per block, and
 * the value the page resolves now (it follows the toolbar's theme).
 */
export function TokenTable({
  file,
  utilities,
  filter,
  contrastOn,
}: {
  file: TokenFile;
  utilities?: Map<string, string[]>;
  filter?: (token: Token) => boolean;
  /** A surface variable: adds the colour's WCAG contrast on it. */
  contrastOn?: string;
}) {
  const tokens = filter ? file.tokens.filter(filter) : file.tokens;
  const columns = [
    '3rem',
    'minmax(14rem,2fr)',
    'minmax(7rem,1fr)',
    ...file.blocks.map(() => 'minmax(7rem,1fr)'),
    'minmax(8rem,1fr)',
    ...(contrastOn ? ['7rem'] : []),
  ].join(' ');
  const header = [
    '',
    'Token',
    'Utility',
    ...file.blocks,
    'Resolved',
    ...(contrastOn ? [`On ${contrastOn}`] : []),
  ];
  return (
    <div
      className="grid items-start gap-x-4 rounded-md border-[1px] border-secondary bg-[var(--card-bg)] px-3 [&>.contents>*]:border-t-[1px] [&>.contents>*]:border-t-secondary"
      style={{ gridTemplateColumns: columns }}
    >
      {header.map((h, i) => (
        <div
          key={i}
          className="py-1.5 text-[11px] font-semibold uppercase tracking-wide text-quaternary"
        >
          {h}
        </div>
      ))}
      {tokens.map((token) => (
        <Fragment key={token.name}>
          {token.section && (
            <div
              className="pb-1 pt-3 text-xs font-semibold text-secondary"
              style={{ gridColumn: '1 / -1' }}
            >
              {token.section}
            </div>
          )}
          <Row
            token={token}
            blocks={file.blocks}
            utilities={utilities}
            contrastOn={contrastOn}
          />
        </Fragment>
      ))}
    </div>
  );
}

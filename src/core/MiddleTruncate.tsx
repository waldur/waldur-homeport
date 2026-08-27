import { FunctionComponent } from 'react';

interface MiddleTruncateProps {
  text: string;
  // Number of trailing characters always kept visible at the end, so a
  // meaningful suffix (an id, a "(Create)" marker, …) stays readable.
  tailLength?: number;
  className?: string;
}

/**
 * Truncates the MIDDLE of a string ("start…end") using CSS only — no width
 * measurement. The head shrinks and gets an ellipsis while the tail is pinned,
 * so the full text shows whenever there is room and the middle collapses only
 * when the container is too narrow. The element must live in a width-constrained
 * flex context (e.g. a breadcrumb item with min-width: 0) for the head to clip.
 */
export const MiddleTruncate: FunctionComponent<MiddleTruncateProps> = ({
  text,
  tailLength = 12,
  className,
}) => {
  const classes = className
    ? `middle-truncate ${className}`
    : 'middle-truncate';

  // Too short to benefit from a head/tail split — render as one ellipsis span.
  if (text.length <= tailLength + 4) {
    return (
      <span
        className={`${classes} middle-truncate--simple`}
        title={text}
        data-testid="middle-truncate-whole"
      >
        {text}
      </span>
    );
  }

  const rawHead = text.slice(0, text.length - tailLength);
  const rawTail = text.slice(text.length - tailLength);
  // A split landing on a space swallows it: whitespace at the boundary between
  // the two inline spans is collapsed, so "Quantum Error Correction Simulations"
  // rendered as "…CorrectionSimulations". Whichever side the space falls on,
  // pin it to the head as a non-breaking one — it cannot collapse, and keeping
  // it out of the tail leaves the pinned suffix the width it was sized for.
  const head = /^\s/.test(rawTail)
    ? `${rawHead}\u00A0`
    : /\s$/.test(rawHead)
      ? rawHead.replace(/\s+$/, '\u00A0')
      : rawHead;
  const tail = rawTail.replace(/^\s+/, '');

  return (
    <span className={classes} title={text}>
      {/* The head/tail split is a layout device: on its own it would put two
          mid-word fragments ("HPC Cl" + "uster Access") into the accessibility
          tree. Carry the intact string in a visually hidden node and hide the
          fragments from assistive technology so the name is announced once. */}
      <span className="visually-hidden">{text}</span>
      <span
        className="middle-truncate-head"
        aria-hidden="true"
        data-testid="middle-truncate-head"
      >
        {head}
      </span>
      <span
        className="middle-truncate-tail"
        aria-hidden="true"
        data-testid="middle-truncate-tail"
      >
        {tail}
      </span>
    </span>
  );
};

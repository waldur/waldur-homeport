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
      <span className={`${classes} middle-truncate--simple`} title={text}>
        {text}
      </span>
    );
  }

  const head = text.slice(0, text.length - tailLength);
  const tail = text.slice(text.length - tailLength);

  return (
    <span className={classes} title={text}>
      <span className="middle-truncate-head">{head}</span>
      <span className="middle-truncate-tail">{tail}</span>
    </span>
  );
};

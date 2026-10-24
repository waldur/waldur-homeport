import { translate } from 'waldur-i18n-runtime';

// The limits of POST /api/export-pdf/ (EXPORT_PDF_* in waldur-mastermind's
// waldur_core/core/serializers.py). Rendering costs the server memory for
// every cell, so a larger table is better off as CSV or Excel.
const PDF_MAX_ROWS = 10_000;
const PDF_MAX_COLUMNS = 100;
export const PDF_MAX_CELLS = 50_000;
const PDF_MAX_CHARACTERS = 1_000_000;

/** Why a table of this size cannot be exported as PDF, if it cannot.
 * `columns` is unknown for a table that builds its own rows. */
export const getPdfSizeWarning = (
  rows: number,
  columns?: number,
): string | undefined => {
  if (columns === undefined) {
    return rows <= PDF_MAX_ROWS
      ? undefined
      : translate(
          'This export has {rows} rows, but a PDF holds at most {maxRows}. Export it as CSV or Excel, or narrow it down with filters.',
          {
            rows: rows.toLocaleString(),
            maxRows: PDF_MAX_ROWS.toLocaleString(),
          },
        );
  }
  if (
    rows <= PDF_MAX_ROWS &&
    columns <= PDF_MAX_COLUMNS &&
    rows * columns <= PDF_MAX_CELLS
  ) {
    return undefined;
  }
  return translate(
    'This export has {rows} rows and {columns} columns, but a PDF holds at most {maxRows} rows, {maxColumns} columns and {maxCells} cells. Export it as CSV or Excel, or narrow it down with filters or fewer columns.',
    {
      rows: rows.toLocaleString(),
      columns: columns.toLocaleString(),
      maxRows: PDF_MAX_ROWS.toLocaleString(),
      maxColumns: PDF_MAX_COLUMNS.toLocaleString(),
      maxCells: PDF_MAX_CELLS.toLocaleString(),
    },
  );
};

/** Characters as the server counts them: by code point, so an emoji is one
 * character rather than the two UTF-16 units of `length`. */
export const countCharacters = (text: string) => {
  let count = text.length;
  for (let i = 0; i < text.length; i++) {
    const unit = text.charCodeAt(i);
    if (unit >= 0xdc00 && unit <= 0xdfff) {
      count--;
    }
  }
  return count;
};

export const getPdfTextWarning = (characters: number): string | undefined =>
  characters <= PDF_MAX_CHARACTERS
    ? undefined
    : translate(
        'This export has {characters} characters of text, but a PDF holds at most {maxCharacters}. Export it as CSV or Excel instead.',
        {
          characters: characters.toLocaleString(),
          maxCharacters: PDF_MAX_CHARACTERS.toLocaleString(),
        },
      );

/** The title as the API takes it: at most 255 characters, counted by code
 * point so that an emoji is never cut in half. */
export const getPdfTitle = (title?: string) =>
  Array.from(title ?? '')
    .slice(0, 255)
    .join('');

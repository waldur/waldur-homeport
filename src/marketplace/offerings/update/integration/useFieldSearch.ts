import { useMemo } from 'react';

interface SearchableField {
  key: string;
  label?: string;
  title?: string;
  description?: string;
}

export const useFieldSearch = <F extends SearchableField>(
  fields: F[],
  query: string,
): F[] =>
  useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return fields;
    return fields.filter((f) => {
      const labelText = (f.label ?? f.title ?? '').toLowerCase();
      const descText = (f.description ?? '').toLowerCase();
      return (
        labelText.includes(q) ||
        f.key.toLowerCase().includes(q) ||
        descText.includes(q)
      );
    });
  }, [fields, query]);

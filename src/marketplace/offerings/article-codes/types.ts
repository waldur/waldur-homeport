import type { ArticleCodeUpdatePreviewItem } from 'waldur-js-client';

export interface ArticleCodeFormValues {
  search: string;
  replace: string;
  category?: { uuid: string; title: string };
  customer?: { uuid: string; name: string };
  offering_state?: { value: string; label: string };
  offering_name?: string;
  previewResults?: ArticleCodeUpdatePreviewItem[];
}

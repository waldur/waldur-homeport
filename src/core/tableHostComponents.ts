import { lazyComponent } from '@/core/lazyComponent';
import { ErrorMessage } from '@/ErrorMessage';
import { TableHost } from '@/table/host';

/**
 * What tables take from homeport besides the router (`tableHost.ts`, which
 * takes these as its argument): the
 * message a crashed table shows and how its dialogs' chunks load. Apart from
 * the router part so Storybook can use it, and so unit tests, which set up
 * the router part for every file, do not load the chunk loader before a
 * test has mocked what it imports.
 */
export const homeportTableComponents: Partial<TableHost> = {
  ErrorFallback: ErrorMessage,
  lazyComponent,
};

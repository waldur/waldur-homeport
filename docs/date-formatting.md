# Date formatting

Dates are shown through the formatters in `src/core/dateUtils.ts`. Each one
renders an Intl preset in the **date locale**, never a Luxon token string.

## The date locale

`getDateLocale()` (`waldur-i18n-runtime`, re-exported from
`@/i18n/LanguageUtilsService`) is the UI language, with plain English mapped
to `en-GB` so English dates read day-first (`26 Feb 2027`). Luxon's
`Settings.defaultLocale`, the date-fns calendar locale (`useCalendarLocale`)
and every direct `Intl`/`toLocaleDateString` call take their locale from it.
Never pass `undefined` (the browser's locale) or `getUserLocale()` to a date
call: those ignore the language the user picked, or keep English month-first.

## Formatters

| Helper                 | en-GB                         | Use for                   |
| ---------------------- | ----------------------------- | ------------------------- |
| `formatDate`           | 26 Feb 2027                   | a date                    |
| `formatLongDate`       | 26 February 2027              | a date in prose           |
| `formatDateTime`       | 26 Feb 2027, 14:05            | a timestamp               |
| `formatMediumDateTime` | 26 February 2027 at 14:05 EET | a timestamp with its zone |
| `formatTime`           | 14:05                         | a time of day             |
| `formatDayMonth`       | 26 Feb                        | chart axes within a year  |
| `formatDayMonthTime`   | 26 Feb, 14:05                 | schedule slots            |
| `formatMonth`          | February 2027                 | a month                   |
| `formatShortMonth`     | Feb 2027                      | month axes and ranges     |
| `formatMonthName`      | February                      | a month without a year    |
| `formatRelative`       | in 3 days                     | distance from now         |
| `formatUptime`         | 2d 3h                         | elapsed time              |

Other locales get their own pattern: `formatDate` is `26 февр. 2027 г.` in
Russian, `26.2.2027` in Finnish and `2027-02-26` in Lithuanian. That is
intended. No token string is right everywhere: `MMMM` is the genitive ("of
February") and wrong for a month on its own, and `LLL` turns into a bare
number in Lithuanian.

British English writes September short as `Sept` (`29 Sept 2026`). In tests,
build the expected string with the formatter (`formatDate('2026-09-29')`)
rather than hard-coding a month abbreviation, since CLDR revises them.

A missing value (`null`/`undefined`) formats as a dash, and `parseDate(null)`
is an invalid `DateTime`, not now. Pass `DateTime.now()` when you mean now.

## Calendar dates and instants

A value like `2026-09-30` is a day, not an instant. `parseCalendarDate` reads
one as the start of that day in the local zone, and it keeps the date a
timestamp names in its own offset, so `2026-09-30T00:00:00Z` stays 30 Sep west
of UTC. `formatRelative`, `lastAccessDate` and `daysUntilAccessEnds` use it.
Never `new Date('2026-09-30')`: that is UTC midnight, the 29th in the Americas.

## Lint: `no-display-date-tokens`

`.toFormat()` with a display token, given as a literal or a `const` (`MMM`, `LLL`, `MMMM`, weekday names, the
`D`/`t`/`T` macros, `a`) or a numeric date not starting with the year
(`dd.MM.yyyy`, `MM/yyyy`) is an error. Machine formats stay allowed:
`yyyy-MM`, `yyyy-MM-dd`, `yyyy-MM-dd HH:mm`, `HH:mm`, a Duration's `hh:mm:ss`.

## Lint: `no-browser-locale-date`

`toLocaleDateString` / `toLocaleTimeString`, `toLocaleString` with date
options or on a `new Date(…)`, and `Intl.DateTimeFormat` are errors when the locale is missing,
`undefined` or `getUserLocale()`. Prefer a `dateUtils` formatter; where a
native call is needed (a custom option set), pass `getDateLocale()`.

/**
 * Story/test helpers for the date pickers — imported by path
 * (`waldur-ui/src/DatePicker/testing`), never through the package index,
 * so `storybook/test` stays out of application bundles.
 *
 * `driver` operates the pickers through their DOM (open, page, pick a day,
 * set a time, read what is shown); `values` holds the serialisation and
 * readout the stories assert against. Stories in waldur-ui and in the app
 * (the react-final-form adapters and the screens that use the pickers)
 * share them, so a markup change is fixed in one place.
 */
export * from './driver';
export * from './values';

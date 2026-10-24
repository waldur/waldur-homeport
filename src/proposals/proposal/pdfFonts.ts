import italics from '@fontsource/open-sans/files/open-sans-all-400-italic.woff';
import normal from '@fontsource/open-sans/files/open-sans-all-400-normal.woff';
import bolditalics from '@fontsource/open-sans/files/open-sans-all-800-italic.woff';
import bold from '@fontsource/open-sans/files/open-sans-all-800-normal.woff';

// pdfmake's fonts, now only for the proposal document. Table and chart
// exports are rendered on the server (waldur/waldur-mastermind#851).

const getAbsolutePath = (path) => new URL(path, document.baseURI).href;

export const getFonts = () => ({
  OpenSans: {
    normal: getAbsolutePath(normal),
    bold: getAbsolutePath(bold),
    italics: getAbsolutePath(italics),
    bolditalics: getAbsolutePath(bolditalics),
  },
});

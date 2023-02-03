import FileSaver from 'file-saver';

function saveAsPdf(table, data) {
  const blob = new Blob([data], { type: 'application/pdf' });
  FileSaver.saveAs(blob, `${table}.pdf`);
}

const getAbsolutePath = (path) => new URL(path, document.baseURI).href;

const getFonts = () => ({
  OpenSans: {
    normal: getAbsolutePath(
      require('@fontsource/open-sans/files/open-sans-all-400-normal.woff'),
    ),
    bold: getAbsolutePath(
      require('@fontsource/open-sans/files/open-sans-all-800-normal.woff'),
    ),
    italics: getAbsolutePath(
      require('@fontsource/open-sans/files/open-sans-all-400-italic.woff'),
    ),
    bolditalics: getAbsolutePath(
      require('@fontsource/open-sans/files/open-sans-all-800-italic.woff'),
    ),
  },
});

export async function exportAsPdf(table, data) {
  const pdfmake = (await import('pdfmake/build/pdfmake')).default;
  const header = data.fields.map((field) => ({
    text: field + '',
    style: 'tableHeader',
  }));
  const rows = data.data.map((row) =>
    row.map((cell) => ({
      text: cell + '',
    })),
  );
  const doc: Record<string, object> = {
    content: [
      {
        text: table,
        style: 'title',
      },
      {
        table: {
          body: [header].concat(rows),
        },
      },
    ],
    styles: {
      tableHeader: {
        bold: true,
        fontSize: 11,
        color: 'white',
        fillColor: '#2d4154',
        alignment: 'center',
      },
      title: {
        alignment: 'center',
        fontSize: 15,
      },
    },
    defaultStyle: {
      font: 'OpenSans',
    },
  };
  const fonts = getFonts();
  const pdf = pdfmake.createPdf(doc, null, fonts);
  pdf.getBuffer((buffer) => saveAsPdf(table, buffer));
}

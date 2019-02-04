import FileSaver from 'file-saver';

const templates = {
  '[Content_Types].xml':
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="xml" ContentType="application/xml" />' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />' +
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" />' +
      '<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>' +
      '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml" />' +
    '</Types>',

  '_rels/.rels':
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
    '</Relationships>',

  'xl/_rels/workbook.xml.rels':
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
      '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>' +
    '</Relationships>',

  'xl/workbook.xml':
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
      '<sheets>' +
        '<sheet name="report" sheetId="1" r:id="rId1"/>' +
      '</sheets>' +
    '</workbook>',
};

export class SharedStrings {
  private strings: string[] = [];

  getIndex(value: string) {
    const index = this.strings.indexOf(value);
    if (index !== -1) {
      return index;
    }
    return this.strings.push(value) - 1;
  }

  escapeValue(value) {
    return value.replace(/&/g, '&amp;')
                .replace(/'/g, '&apos;')
                .replace(/>/g, '&gt;')
                .replace(/</g, '&lt;');
  }

  formatStrings() {
    return this.strings.map(value => `<si><t>${this.escapeValue(value)}</t></si>`).join('');
  }

  serialize() {
    const count = this.strings.length;
    return (
      '<?xml version="1.0" encoding="UTF-8"?>' +
      `<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" uniqueCount="${count}" count="${count}">` +
        this.formatStrings() +
      '</sst>'
    );
  }
}

const getColumnLetter = col => {
  if (col <= 0) {
      throw Error('col must be more than 0');
  }
  const array = [];
  while (col > 0) {
      let remainder = col % 26;
      col /= 26;
      col = Math.floor(col);
      if (remainder === 0) {
          remainder = 26;
          col--;
      }
      array.push(64 + remainder);
  }
  return String.fromCharCode.apply(null, array.reverse());
};

function addToZip(zip, path, content) {
  const parts = path.split('/');
  const file = parts.pop('/');
  const folder = parts.reduce((dest, part) => dest.folder(part), zip);
  folder.file(file, content);
}

function formatCell(ref, type, value) {
  return `<c r="${ref}" t="${type}"><v>${value}</v></c>`;
}

export function getSheetData(sharedStrings: SharedStrings, rows: any[][]) {
  return rows.map((row, rowIndex) => {
    const rowRef = rowIndex + 1;
    const cells = row.map((value, cellIndex) => {
      const colRef = getColumnLetter(cellIndex + 1) + rowRef;
      switch (typeof value) {
      case 'boolean':
        return formatCell(colRef, 'b', value ? 1 : 0);
      case 'number':
        return formatCell(colRef, 'n', value);
      default:
        return formatCell(colRef, 's', sharedStrings.getIndex(value + ''));
      }
    }).join('');
    return `<row r="${rowRef}">${cells}</row>`;
  }).join('');
}

export function getSheet(sharedStrings: SharedStrings, rows: any[][]) {
  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ' +
      'xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" ' +
      'xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">' +
      '<sheetData>' +
      getSheetData(sharedStrings, rows) +
      '</sheetData>' +
    '</worksheet>'
  );
}

export default async function exportExcel(table, data) {
  const JSZip = await import(/* webpackChunkName: "jszip" */ 'jszip');
  const zip = new JSZip.default();
  for (const path in templates) {
    if (templates.hasOwnProperty(path)) {
      addToZip(zip, path, templates[path]);
    }
  }
  const sharedStrings = new SharedStrings();
  const rows = [data.fields].concat(data.data);
  const sheet = getSheet(sharedStrings, rows);
  addToZip(zip, 'xl/worksheets/sheet1.xml', sheet);
  addToZip(zip, 'xl/sharedStrings.xml', sharedStrings.serialize());
  zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  }).then(blob => {
    FileSaver.saveAs(blob, `${table}.xlsx`);
  });
}

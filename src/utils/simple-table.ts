export const toSimpleTable = (title: string, headers: any[], content: any[]) => {
  const style = `
   <style>
    body {
      -webkit-print-color-adjust: exact;
      font-family: sans-serif;
    }
    @page {
      size: A4 landscape;
    }

    th,td,tr {
      font-size: 8pt!important;
      text-align: right;
      white-space: no-wrap;
    }
    table {
      page-break-inside:avoid;
      border-collapse: collapse;
    }

    td, th {
      border: 1px solid #ddd;
      padding: 8px;
    }

    tr:nth-child(even){background-color: #f2f2f2;}

    th {
      padding-top: 12px;
      padding-bottom: 12px;
    }
   </style>
  `
  const stripDoubleQuotes = (v: string): any => {
    const res = v && v.replace(/['"]+/g, '')
    if (!res) {
      return null
    } else if (res === 'undefined') {
      return null
    } else if (res === 'null') {
      return null
    } else {
      return res
    }
  }
  const theaders = headers.map((header) => {
    return `<th>${header}</th>`
  }).join(' ')

  const tbody = content.map((column) => {
    return `
    <tr>
      ${Object.values(column).map((v: any) => `
        <td>${stripDoubleQuotes(v && v.toString()) || '-'}</td>
      `).join(' ')}
    </tr>`
  }).join(' ')

  return `
  <head>
   ${style}
   <title>${title}</title>
  </head>
  <body>
    <table style="width:100%">
     <thead>
        <tr>
          ${theaders}
        </tr>
      </thead>
      <tbody>
        ${tbody}
      </tbody>
    </table>
  </body>
  `
}

/**
 * INVOICE STUDIO — Google Sheet Sync Script
 * ------------------------------------------------
 * SETUP (one-time):
 * 1. Open the Google Sheet where you want invoices logged.
 * 2. Click Extensions -> Apps Script.
 * 3. Delete any starter code in the editor, and paste in this entire file.
 * 4. Click the "Save" (disk) icon. Name the project anything you like.
 * 5. Click "Deploy" -> "New deployment".
 * 6. Click the gear icon next to "Select type" and choose "Web app".
 * 7. Set:
 *      Execute as:      Me
 *      Who has access:  Anyone
 * 8. Click "Deploy". Google will ask you to authorize — click through
 *    "Advanced" -> "Go to (project name)" -> "Allow" (this is your own
 *    script, so it's safe to authorize).
 * 9. Copy the "Web app URL" you're given (ends in /exec).
 * 10. Paste that URL into the "Google Sheet Web App URL" field in the
 *     Invoice Studio tool. That's it — invoices will now log to this
 *     sheet automatically every time you click "Generate & Download PDF".
 *
 * NOTE: If you ever change the deployment (redeploy as a new version),
 * you'll get a new URL — update it in the tool.
 */

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Invoices') || ss.insertSheet('Invoices');

  var data = JSON.parse(e.postData.contents);

  var headers = [
    'Invoice No', 'Invoice Date', 'Order Reference', 'Buyer Name',
    'Buyer Country', 'Currency', 'Amount Method', 'Exchange Rate',
    'Total (Foreign Currency)', 'Total (INR)', 'Line Items', 'Generated At'
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }

  // find an existing row with the same Invoice No and overwrite it,
  // otherwise append a new row — mirrors the tool's local-storage behavior
  var lastRow = sheet.getLastRow();
  var existingRow = -1;
  if (lastRow > 1) {
    var invoiceNos = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < invoiceNos.length; i++) {
      if (String(invoiceNos[i][0]) === String(data['Invoice No'])) {
        existingRow = i + 2;
        break;
      }
    }
  }

  var row = headers.map(function (h) {
    return data[h] !== undefined ? data[h] : '';
  });

  if (existingRow > -1) {
    sheet.getRange(existingRow, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'Invoice Studio sync endpoint is live.' }))
    .setMimeType(ContentService.MimeType.JSON);
}

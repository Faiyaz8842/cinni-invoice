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

  var data = {};
  try {
    data = JSON.parse(e.postData.contents || '{}');
  } catch (err) {
    data = e.parameter || {};
  }

  var headers = [
    'Invoice No',
    'Invoice Date',
    'Order Reference',
    'Buyer Name',
    'Buyer Add',
    'Buyer Country',
    'Product Details',
    'HSN Code',
    'Quantity',
    'Unit Price (INR)',
    'Currency',
    'Total (Foreign Currency)',
    'Total (INR)',
    'Line Items',
    'Created by',
    'Generated At'
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  } else {
    var existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    headers.forEach(function (header) {
      if (existingHeaders.indexOf(header) === -1) {
        sheet.getRange(1, sheet.getLastColumn() + 1).setValue(header).setFontWeight('bold');
      }
    });
  }

  var currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var invoiceNoCol = currentHeaders.indexOf('Invoice No') + 1;
  var lastRow = sheet.getLastRow();
  var existingRow = -1;

  if (lastRow > 1 && invoiceNoCol > 0) {
    var invoiceNos = sheet.getRange(2, invoiceNoCol, lastRow - 1, 1).getValues();
    for (var i = 0; i < invoiceNos.length; i++) {
      if (String(invoiceNos[i][0]) === String(data['Invoice No'])) {
        existingRow = i + 2;
        break;
      }
    }
  }

  var row = currentHeaders.map(function (header) {
    return data[header] !== undefined ? data[header] : '';
  });

  if (existingRow > -1) {
    sheet.getRange(existingRow, 1, 1, row.length).setValues([row]);
    sheet.getRange(existingRow, 1, 1, row.length).setWrap(true);
  } else {
    sheet.appendRow(row);
    sheet.getRange(sheet.getLastRow(), 1, 1, row.length).setWrap(true);
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

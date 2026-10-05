/**
 * Google Apps Script backend untuk LKPD Bilangan Rasional
 * Disarankan dibuat sebagai standalone project di script.google.com
 * lalu isi SPREADSHEET_ID dengan ID Google Sheet Anda.
 */
const SPREADSHEET_ID = 'PASTE_SPREADSHEET_ID_HERE';

function getSpreadsheet_(){
  if (SPREADSHEET_ID && SPREADSHEET_ID !== 'PASTE_SPREADSHEET_ID_HERE') {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function json_(obj){
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function setupSheets(){
  const ss = getSpreadsheet_();
  ensureSheet_(ss, 'Students', ['timestamp','appId','studentName','studentClass','source']);
  ensureSheet_(ss, 'Progress', ['timestamp','appId','studentName','studentClass','pageId','pageIndex','title']);
  ensureSheet_(ss, 'WorksheetResults', ['timestamp','appId','studentName','studentClass','pageVisited','answersJson']);
}

function ensureSheet_(ss, name, headers){
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) sh.appendRow(headers);
  return sh;
}

function doGet(e){
  return json_({ok:true, message:'API LKPD Bilangan Rasional aktif'});
}

function doPost(e){
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    const action = data.action;
    const appId = data.appId || '';
    const payload = data.payload || {};
    const ss = getSpreadsheet_();
    setupSheets();

    if (action === 'registerStudent') {
      ss.getSheetByName('Students').appendRow([
        new Date(), appId, payload.studentName || '', payload.studentClass || '', payload.source || ''
      ]);
      return json_({ok:true, action});
    }

    if (action === 'saveProgress') {
      ss.getSheetByName('Progress').appendRow([
        new Date(), appId, payload.studentName || '', payload.studentClass || '', payload.pageId || '', payload.pageIndex || '', payload.title || ''
      ]);
      return json_({ok:true, action});
    }

    if (action === 'saveWorksheetResult') {
      ss.getSheetByName('WorksheetResults').appendRow([
        new Date(), appId, payload.studentName || '', payload.studentClass || '', payload.pageVisited || '', JSON.stringify(payload.answers || {})
      ]);
      return json_({ok:true, action});
    }

    return json_({ok:false, message:'Action tidak dikenal'});
  } catch(err){
    return json_({ok:false, message:String(err)});
  }
}

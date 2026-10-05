/**
 * Backend Google Apps Script untuk MPI Bilangan Rasional.
 * Hubungkan project Apps Script ini ke sebuah Google Spreadsheet.
 * Jalankan setupSheets() sekali dari editor sebelum deploy.
 */

const SHEETS = {
  STUDENTS: 'Students',
  PROGRESS: 'Progress',
  QUIZ: 'QuizResults'
};

function doGet() {
  return json_({
    ok: true,
    service: 'MPI Bilangan Rasional API',
    time: new Date().toISOString()
  });
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const action = body.action || '';
    const payload = body.payload || {};
    const appId = body.appId || '';

    if (!action) return json_({ ok:false, message:'Action kosong' });

    switch (action) {
      case 'saveStudent':
        return json_(saveStudent_(appId, payload));
      case 'saveProgress':
        return json_(saveProgress_(appId, payload));
      case 'saveQuiz':
        return json_(saveQuiz_(appId, payload));
      default:
        return json_({ ok:false, message:'Action tidak dikenal' });
    }
  } catch (err) {
    return json_({ ok:false, message:String(err && err.message ? err.message : err) });
  }
}

function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheet_(ss, SHEETS.STUDENTS, ['timestamp','appId','studentName','studentClass','source']);
  ensureSheet_(ss, SHEETS.PROGRESS, ['timestamp','appId','studentName','studentClass','module','progressValue']);
  ensureSheet_(ss, SHEETS.QUIZ, ['timestamp','appId','studentName','studentClass','score','totalQuestions','answers']);
}

function saveStudent_(appId, p) {
  append_(SHEETS.STUDENTS, [new Date(), appId, clean_(p.studentName), clean_(p.studentClass), clean_(p.source)]);
  return { ok:true, message:'Student saved' };
}

function saveProgress_(appId, p) {
  append_(SHEETS.PROGRESS, [new Date(), appId, clean_(p.studentName), clean_(p.studentClass), clean_(p.module), Number(p.progressValue || 0)]);
  return { ok:true, message:'Progress saved' };
}

function saveQuiz_(appId, p) {
  append_(SHEETS.QUIZ, [new Date(), appId, clean_(p.studentName), clean_(p.studentClass), Number(p.score || 0), Number(p.totalQuestions || 0), clean_(p.answers)]);
  return { ok:true, message:'Quiz saved' };
}

function append_(sheetName, row) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(sheetName);
  if (!sh) throw new Error('Sheet ' + sheetName + ' belum tersedia. Jalankan setupSheets().');
  sh.appendRow(row);
}

function ensureSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) sh.appendRow(headers);
  sh.setFrozenRows(1);
  sh.getRange(1,1,1,headers.length).setFontWeight('bold');
}

function clean_(v) {
  if (v === null || v === undefined) return '';
  return String(v).replace(/[\r\n]+/g,' ').trim().slice(0,500);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

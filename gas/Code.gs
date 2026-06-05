// Google Apps Script - 血圧管理アプリ バックエンド
// 列順: A=timestamp, B=systolic, C=diastolic, D=pulse, E=weight, F=bmi, G=location, H=memo

const LOCATIONS = ['自宅', '病院', 'DS', 'その他'];

function doGet(e) {
  const action = e.parameter.action;
  if (action === "get") return getRecords();
  return respond({ error: "Unknown action" });
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  if (data.action === "add")    return addRecord(data);
  if (data.action === "update") return updateRecord(data);
  if (data.action === "delete") return deleteRecord(data);
  return respond({ error: "Unknown action" });
}

function getSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
}

function getRecords() {
  const sheet = getSheet();
  const rows = sheet.getDataRange().getValues();
  // ISO timestamp（2026-xx-xxT...）の行のみ取得し、ヘッダー行を除外
  const records = rows
    .filter(row => /^\d{4}-\d{2}-\d{2}T/.test(String(row[0])))
    .map(row => ({
      timestamp: String(row[0]),
      systolic:  String(row[1]),
      diastolic: String(row[2]),
      pulse:     String(row[3]),
      weight:    String(row[4]),
      bmi:       String(row[5]),
      location:  String(row[6]),
      memo:      String(row[7])
    }));
  records.reverse(); // 新しい順
  return respond({ records: records });
}

function addRecord(data) {
  const sheet = getSheet();
  sheet.appendRow([
    data.timestamp || "",
    data.systolic  || "",
    data.diastolic || "",
    data.pulse     || "",
    data.weight    || "",
    data.bmi       || "",
    data.location  || "",
    data.memo      || ""
  ]);
  return respond({ success: true });
}

// タイムスタンプで行を検索（1-indexed 行番号、見つからなければ -1）
function findRowByTimestamp(sheet, timestamp) {
  const values = sheet.getDataRange().getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]) === String(timestamp)) return i + 1;
  }
  return -1;
}

function updateRecord(data) {
  const sheet = getSheet();
  const rowNum = findRowByTimestamp(sheet, data.originalTimestamp);
  if (rowNum === -1) return respond({ error: "Record not found: " + data.originalTimestamp });
  sheet.getRange(rowNum, 1, 1, 8).setValues([[
    data.timestamp || data.originalTimestamp,
    data.systolic  || "",
    data.diastolic || "",
    data.pulse     || "",
    data.weight    || "",
    data.bmi       || "",
    data.location  || "",
    data.memo      || ""
  ]]);
  return respond({ success: true });
}

function deleteRecord(data) {
  const sheet = getSheet();
  const rowNum = findRowByTimestamp(sheet, data.timestamp);
  if (rowNum === -1) return respond({ error: "Record not found: " + data.timestamp });
  sheet.deleteRow(rowNum);
  return respond({ success: true });
}

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// =====================================================================
// 【一回限りの移行スクリプト】列順を正しい形式に並べ替える
// GASエディタから手動で実行し、完了後はこの関数を削除してください
// =====================================================================
function migrateColumns() {
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();

  const newValues = values.map((row, idx) => {
    // ヘッダー行
    if (idx === 0) {
      return ['日時', '収縮期', '拡張期', '脈拍', '体重', 'BMI', '場所', 'メモ'];
    }

    const ts   = row[0];
    const sys  = row[1];
    const dia  = row[2];
    const pulse= row[3];
    const colE = row[4]; // 旧: 場所 or 新: 体重
    const colF = row[5]; // 旧: メモ  or 新: BMI
    const colG = row[6]; // 旧: 体重  or 新: 場所
    const colH = row[7] !== undefined ? row[7] : '';

    // 旧形式判定: E列に場所の値（自宅/病院/DS/その他）が入っている
    if (LOCATIONS.includes(String(colE).trim())) {
      // 旧形式: E=場所, F=メモ, G=体重  →  E=体重, F=BMI(空), G=場所, H=メモ
      return [ts, sys, dia, pulse, colG, '', colE, colF];
    } else {
      // 新形式: E=体重, F=BMI, G=場所, H=メモ（すでに正しい）
      return [ts, sys, dia, pulse, colE, colF, colG, colH];
    }
  });

  // シート全体をクリアして書き直す
  sheet.clearContents();
  sheet.getRange(1, 1, newValues.length, 8).setValues(newValues);

  Logger.log('移行完了: ' + (newValues.length - 1) + '件のデータを変換しました');
}

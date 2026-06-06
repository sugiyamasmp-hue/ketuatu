// Google Apps Script - 血圧管理アプリ バックエンド
// 列順: A=timestamp, B=systolic, C=diastolic, D=pulse, E=weight, F=bmi, G=location, H=memo

const LOCATIONS = ['自宅', '病院', 'DS', 'その他'];

function doGet(e) {
  const action = e.parameter.action;
  if (action === "get") return getRecords();
  return respond({ error: "Unknown action" });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.action === "add")    return addRecord(data);
    if (data.action === "update") return updateRecord(data);
    if (data.action === "delete") return deleteRecord(data);
    return respond({ error: "Unknown action: " + data.action });
  } catch (err) {
    return respond({ error: "Parse error: " + err.message });
  }
}

function getSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
}

// セル値を ISO タイムスタンプ文字列に変換（Date 型にも対応）
function cellToTimestamp(val) {
  if (val instanceof Date) return val.toISOString();
  return String(val);
}

function getRecords() {
  const sheet = getSheet();
  const rows = sheet.getDataRange().getValues();
  const records = rows
    .map(row => ({ ...row, _ts: cellToTimestamp(row[0]) }))
    .filter(row => /^\d{4}-\d{2}-\d{2}T/.test(row._ts))
    .map(row => ({
      timestamp: row._ts,
      systolic:  String(row[1]),
      diastolic: String(row[2]),
      pulse:     String(row[3]),
      weight:    String(row[4]),
      bmi:       String(row[5]),
      location:  String(row[6]),
      memo:      String(row[7])
    }));
  records.reverse(); // 新しい順
  return respond({ success: true, records: records });
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
// Date 型セルにも対応
function findRowByTimestamp(sheet, timestamp) {
  const values = sheet.getDataRange().getValues();
  const target = String(timestamp);
  for (let i = 0; i < values.length; i++) {
    if (cellToTimestamp(values[i][0]) === target) return i + 1;
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
    if (idx === 0) {
      return ['日時', '収縮期', '拡張期', '脈拍', '体重', 'BMI', '場所', 'メモ'];
    }
    const ts   = row[0];
    const sys  = row[1];
    const dia  = row[2];
    const pulse= row[3];
    const colE = row[4];
    const colF = row[5];
    const colG = row[6];
    const colH = row[7] !== undefined ? row[7] : '';

    if (LOCATIONS.includes(String(colE).trim())) {
      return [ts, sys, dia, pulse, colG, '', colE, colF];
    } else {
      return [ts, sys, dia, pulse, colE, colF, colG, colH];
    }
  });

  sheet.clearContents();
  sheet.getRange(1, 1, newValues.length, 8).setValues(newValues);
  Logger.log('移行完了: ' + (newValues.length - 1) + '件のデータを変換しました');
}

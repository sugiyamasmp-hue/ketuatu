// Google Apps Script - 血圧管理アプリ バックエンド
// スプレッドシートの列順: A=timestamp, B=systolic, C=diastolic, D=pulse, E=weight, F=bmi, G=location, H=memo

function doGet(e) {
  const action = e.parameter.action;
  if (action === "get") {
    return getRecords();
  }
  return respond({ error: "Unknown action" });
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  if (data.action === "add") return addRecord(data);
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
  const records = rows
    .filter(row => row[0] !== "" && row[0] !== "timestamp")
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
  // 新しい順で返す
  records.reverse();
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

// タイムスタンプで行を検索（1-indexed 行番号を返す。見つからなければ -1）
function findRowByTimestamp(sheet, timestamp) {
  const values = sheet.getDataRange().getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]) === String(timestamp)) {
      return i + 1;
    }
  }
  return -1;
}

function updateRecord(data) {
  const sheet = getSheet();
  const rowNum = findRowByTimestamp(sheet, data.originalTimestamp);
  if (rowNum === -1) {
    return respond({ error: "Record not found: " + data.originalTimestamp });
  }
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
  if (rowNum === -1) {
    return respond({ error: "Record not found: " + data.timestamp });
  }
  sheet.deleteRow(rowNum);
  return respond({ success: true });
}

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

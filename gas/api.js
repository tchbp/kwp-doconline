const getSheetData = (name) => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  const dataRange = sheet.getDataRange();
  const data = dataRange.getDisplayValues();
  const heads = data.shift();
  const obj = data.map((r) =>
    heads.reduce((o, k, i) => ((o[k] = r[i] || ""), o), {}),
  );
  return JSON.stringify(obj);
};

const getDataNew5 = (name) => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  const heads = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rowData = sheet.getLastRow() - 1;

  let objData = [];
  let dataRange;
  if (rowData > 0) {
    if (rowData > 5) {
      dataRange = sheet.getRange(
        sheet.getLastRow() - 4,
        1,
        5,
        sheet.getLastColumn(),
      );
    } else {
      dataRange = sheet.getRange(
        2,
        1,
        sheet.getLastRow() - 1,
        sheet.getLastColumn(),
      );
    }
    objData = dataRange
      .getDisplayValues()
      .map((r) => heads.reduce((o, k, i) => ((o[k] = r[i] || ""), o), {}));
  }

  return JSON.stringify(objData);
};

const getSheetNamesAndHeaders = () => {
  const sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  const sheetNames = sheets.map((sheet) => sheet.getName());

  const headers = sheets.map((sheet) => {
    const dataRange = sheet.getDataRange();
    const headers = dataRange.getValues()[0];
    return { [sheet.getName()]: headers };
  });
  return { sheetNames, headers };
};

const getStudentData = (stdClass) => {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("studentAll");
  Logger.log(stdClass);
  const foundStd = sheet
    .getRange(2, 4, sheet.getLastRow() - 1, 1)
    .createTextFinder(stdClass)
    .findAll();
  let obj = [];
  let key = 0;
  foundStd.forEach((std) => {
    const stdVal = sheet.getRange(std.getRow(), 7, 1, 5).getValues();
    obj.push({
      key: key++,
      id: stdVal[0][0],
      name: `${stdVal[0][2]}${stdVal[0][3]}  ${stdVal[0][4]}`,
    });
  });

  Logger.log(JSON.stringify(obj));

  return JSON.stringify(obj);
};

const sendFile = (file, data) => {
  const { name, title, filename } = data;
  const folderId = "13rFNJY8UrlgUZPdygS1keigDPmnJ3iXl";
  Logger.log(`naame : ${name} title : ${title}`);
  const folder = DriveApp.getFolderById(folderId);

  const contentType = file.substring(5, file.indexOf(";"));
  const bytes = Utilities.base64Decode(
    file.substr(file.indexOf("base64,") + 7),
  );
  const blob = Utilities.newBlob(bytes, contentType, filename);

  const upFile = folder.createFile(blob);
  const upFileId = upFile.getId();

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("upFile");
  const row2Up = sheet.getLastRow() + 1;
  sheet.getRange(row2Up, 1, 1, 3).setValues([[name, title, upFileId]]);

  return `File uploaded successfully: ${filename}`;
};

const sendFileCommand = (file, data) => {
  const { nocmd, atdate, title, workgroup, memo, filename } = data;
  const folderId = "1deaBJP4Fz6pizrlgNoZ1U2DHrSCwPTdt";

  const folder = DriveApp.getFolderById(folderId);

  const contentType = file.substring(5, file.indexOf(";"));
  const bytes = Utilities.base64Decode(
    file.substr(file.indexOf("base64,") + 7),
  );
  const blob = Utilities.newBlob(bytes, contentType, filename);

  const upFile = folder.createFile(blob);
  const upFileId = upFile.getId();
  const upFileUrl = upFile.getUrl();

  const data2Rec = [
    nocmd,
    atdate,
    title,
    workgroup,
    memo,
    upFileId,
    upFileUrl,
    new Date(),
  ];
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("doccommand");
  const row2Up = sheet.getLastRow() + 1;
  sheet.getRange(row2Up, 1, 1, data2Rec.length).setValues([data2Rec]);

  const dataRange = sheet.getDataRange();
  const dataNew = dataRange.getDisplayValues();
  const heads = dataNew.shift();
  const obj = dataNew.map((r) =>
    heads.reduce((o, k, i) => ((o[k] = r[i] || ""), o), {}),
  );
  return JSON.stringify(obj);
};

const delDocCommand = (nocmd) => {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("doccommand");
  const foundDoc = sheet
    .getRange(2, 1, sheet.getLastRow() - 1)
    .createTextFinder(nocmd)
    .matchCase(true)
    .matchEntireCell(true)
    .findNext();

  const docRow = foundDoc.getRow();
  const docId = sheet.getRange(docRow, 6).getValue();

  sheet.deleteRow(docRow);
  const docCmd = DriveApp.getFileById(docId);
  docCmd.setTrashed(true);

  const dataRange = sheet.getDataRange();
  const dataNew = dataRange.getDisplayValues();
  const heads = dataNew.shift();
  const obj = dataNew.map((r) =>
    heads.reduce((o, k, i) => ((o[k] = r[i] || ""), o), {}),
  );
  return JSON.stringify(obj);
};

const chkLogin = ({ username, password }) => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("user");
  const foundUser = sheet
    .getRange(2, 7, sheet.getLastRow() - 1, 1)
    .createTextFinder(username)
    .matchCase(true)
    .matchEntireCell(true)
    .findNext();
  let objData = {};
  let arrLog = [username];
  if (foundUser) {
    const arrUser = sheet.getRange(foundUser.getRow(), 6, 1, 5).getValues();
    if (arrUser[0][2] === password) {
      objData.isLogin = true;
      objData.user = arrUser[0][1];
      objData.name = arrUser[0][0];
      objData.level = arrUser[0][3].split(",");
      objData.advice = arrUser[0][4];
      arrLog.push("ผ่าน");
    } else {
      objData.isLogin = false;
      objData.user = arrUser[0][1];
      arrLog.push("ไม่ผ่าน");
    }
  } else {
    objData.isLogin = false;
    arrLog.push("ไม่มี");
  }
  arrLog.push(new Date());
  const shLog =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("login-log");
  shLog
    .getRange(shLog.getLastRow() + 1, 1, 1, arrLog.length)
    .setValues([arrLog]);

  return JSON.stringify(objData);
};

const chPasswd = (objData) => {
  const { username, newUsername, oldPassword, newPassword } = objData;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("user");
  const foundUser = sheet
    .getRange(2, 7, sheet.getLastRow() - 1, 1)
    .createTextFinder(username)
    .matchCase(true)
    .matchEntireCell(true)
    .findNext();
  const row = foundUser.getRow();

  let isChange = false;
  const arrUser = sheet.getRange(row, 6, 1, 4).getValues();
  if (arrUser[0][2] === oldPassword) {
    const arr2Change = [
      newUsername !== "" ? newUsername : username,
      newPassword,
    ];
    sheet.getRange(row, 7, 1, 2).setValues([arr2Change]);
    isChange = true;
  }
  if (newUsername !== "") {
    const nameSh4Ch = ["tchmem", "lineuphomeroom"];
    nameSh4Ch.forEach((sh) => {
      const sh4Ch = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sh);
      let searchUser = sh4Ch
        .getRange(1, 1, sh4Ch.getLastRow(), 1)
        .createTextFinder(username)
        .matchCase(true)
        .matchEntireCell(true);
      let foundUser = searchUser.findNext();
      while (foundUser) {
        const row = foundUser.getRow();
        sh4Ch.getRange(row, 1).setValue(newUsername);
        foundUser = searchUser.findNext();
      }
    });
  }
  return isChange;
};
const getSubj4Teach = (objData) => {
  const { user, all } = objData;
  const objSubj = JSON.parse(getSheetData("subj4usr"));
  let subj4Teach = objSubj;
  if (!all) {
    subj4Teach = objSubj.filter((subj) => subj.user === user);
  }
  //Logger.log(JSON.stringify(objData));
  return JSON.stringify(subj4Teach);
};
const std4Teach = (objData) => {
  const { user, tdate, tclass, tpr } = objData;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("tchmem");
  const codeRef = `${tdate}_${tclass}_${tpr}`;
  const lastRow = sheet.getLastRow();
  let objResult = { act: "" };
  if (lastRow > 1) {
    const findTeach = sheet
      .getRange(2, 9, lastRow - 1, 1)
      .createTextFinder(codeRef)
      .findNext();
    if (findTeach) {
      const row = findTeach.getRow();
      const arrTch = sheet.getRange(row, 1, 1, 2).getValues();
      arrTch[0][0] === user
        ? (objResult.act = "บันทึกแล้ว")
        : (objResult.act = "มีครูอื่นบันทึก");
      objResult.user = arrTch[0][0];
      objResult.name = arrTch[0][1];
    }
  }
  objResult.studentData = getStudentData(tclass);

  return objResult;
};

const std4Homeroom = (objData) => {
  const { user, tdate, tclass, tpr } = objData;
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("lineuphomeroom");
  const codeRef = `${tdate}_${tclass}_${tpr}`;
  const lastRow = sheet.getLastRow();
  let objResult = { act: "" };
  if (lastRow > 1) {
    const findTeach = sheet
      .getRange(2, 8, lastRow - 1, 1)
      .createTextFinder(codeRef)
      .findNext();
    if (findTeach) {
      const row = findTeach.getRow();
      const arrTch = sheet.getRange(row, 1, 1, 2).getValues();
      arrTch[0][0] === user
        ? (objResult.act = "บันทึกแล้ว")
        : (objResult.act = "มีครูอื่นบันทึก");
      objResult.user = arrTch[0][0];
      objResult.name = arrTch[0][1];
    }
  }
  objResult.studentData = getStudentData(tclass);

  return objResult;
};
const putTeachMem = (objData) => {
  const {
    user,
    name,
    tdate,
    tclass,
    tpr,
    subject,
    act,
    memo,
    stdStatus,
    stdKad,
    stdLa,
    t4usr,
  } = objData;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("tchmem");

  const codeRef = `${tdate}_${tclass}_${tpr}`;
  const lastRow = sheet.getLastRow();

  if (lastRow > 1) {
    const findTeach = sheet
      .getRange(2, 9, lastRow - 1, 1)
      .createTextFinder(codeRef)
      .findNext();
    if (findTeach) {
      const row = findTeach.getRow();
      sheet.deleteRow(row);
    }
  }
  const arr2Mem = [
    user,
    name,
    tdate,
    tclass,
    tpr,
    subject,
    act,
    memo,
    codeRef,
    stdKad.toString(),
    stdLa.toString(),
    new Date(),
    t4usr || "",
  ];
  sheet
    .getRange(sheet.getLastRow() + 1, 1, 1, arr2Mem.length)
    .setValues([arr2Mem]);

  const message = "บันทึกข้อมูลเรียบร้อยแล้ว";
  return message;
};

const putHomeroom = (objData) => {
  const {
    user,
    name,
    tdate,
    tclass,
    tpr,
    act,
    memo,
    stdStatus,
    stdKad,
    stdLa,
  } = objData;
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("lineuphomeroom");

  const codeRef = `${tdate}_${tclass}_${tpr}`;
  const lastRow = sheet.getLastRow();

  if (lastRow > 1) {
    const findTeach = sheet
      .getRange(2, 8, lastRow - 1, 1)
      .createTextFinder(codeRef)
      .findNext();
    if (findTeach) {
      const row = findTeach.getRow();
      sheet.deleteRow(row);
    }
  }
  const arr2Mem = [
    user,
    name,
    tdate,
    tclass,
    tpr,
    act,
    memo,
    codeRef,
    stdKad.toString(),
    stdLa.toString(),
    new Date(),
  ];
  sheet
    .getRange(sheet.getLastRow() + 1, 1, 1, arr2Mem.length)
    .setValues([arr2Mem]);

  const message = "บันทึกข้อมูลเรียบร้อยแล้ว";
  return message;
};

const getTeachMem = (objData) => {
  const { user, tdate, tclass } = objData;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("tchmem");

  const refSearch = `${tdate}_${tclass}`;
  const arrFound = sheet
    .getRange(1, 9, sheet.getLastRow(), 1)
    .createTextFinder(refSearch)
    .findAll();
  let tMemFound = {};
  [...Array(9).keys()].map(
    (i) =>
      (tMemFound[`pr${i + 1}`] = {
        pr: String(i + 1),
        tname: "",
        subj: "",
        atc: "",
        memo: "",
        stdabs: "",
      }),
  );
  //Logger.log("tMemFound-0 \n" + JSON.stringify(tMemFound));

  if (arrFound.length > 0) {
    arrFound.map((found) => {
      const row = found.getRow();
      const arrTMem = sheet.getRange(row, 1, 1, 11).getValues();
      const tMem = arrTMem[0];
      const pr = String(tMem[4]);

      let numLa =
        String(tMem[9]) !== ""
          ? String(String(tMem[9]).split(",").length)
          : "-";
      let numKad =
        String(tMem[10]) !== ""
          ? String(String(tMem[10]).split(",").length)
          : "-";

      tMemFound[`pr${pr}`] = {
        pr: pr,
        tname: tMem[1],
        subj: tMem[5],
        atc: tMem[6],
        memo: tMem[7],
        stdabs: `ลา ${numLa} คน ขาด ${numKad} คน`,
      };
    });
  }
  // Logger.log("tMemFound-1 \n" + JSON.stringify(tMemFound));

  //Logger.log(tMemFound);
  const objResult = [...Array(9).keys()].map((i) => {
    return tMemFound[`pr${i + 1}`];
  });
  return JSON.stringify(objResult);
};

const getStdAbs = (objData) => {
  const { user, tdate, tclass } = objData;
  const refMem = `${tdate}_${tclass}`;
  const sheetMem =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("tchmem");
  const arrMem = sheetMem
    .getRange(1, 9, sheetMem.getLastRow(), 1)
    .createTextFinder(refMem)
    .findAll();
  let chked = {};
  arrMem.forEach((mem) => {
    const row = mem.getRow();
    const memData = sheetMem.getRange(row, 1, 1, 11).getValues()[0];
    const pr = memData[4];
    const stdKad = memData[9] !== "" ? memData[9].split(",") : [];
    const stdLa = memData[10] !== "" ? memData[10].split(",") : [];
    chked[`pr${pr}`] = { chk: true, kad: stdKad, la: stdLa };
  });
  //Logger.log(JSON.stringify(chked));

  const sheetStd =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("studentAll");
  const foundStdClass = sheetStd
    .getRange(2, 4, sheetStd.getLastRow() - 1, 1)
    .createTextFinder(tclass)
    .findAll();
  let objStd = {};
  let arrId = [];
  foundStdClass.forEach((std, i) => {
    const row = std.getRow();
    const stdData = sheetStd.getRange(row, 7, 1, 5).getValues();
    const id = stdData[0][0];
    arrId.push(id);
    const stdName = `${stdData[0][2]}${stdData[0][3]}  ${stdData[0][4]}`;
    objStd[id] = {};
    objStd[id]["key"] = i + 1;
    objStd[id]["id"] = id;
    objStd[id]["name"] = stdName;
    [...Array(9).keys()].forEach((pr) => {
      objStd[id][`pr${pr + 1}`] = chked[`pr${pr + 1}`] ? "/" : "";
    });
  });
  //Logger.log(JSON.stringify(objStd));

  /*const shStdAbs =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("stdabsent");
  const refAbs = `${tdate}_${tclass}`;
  const findAbs = shStdAbs
    .getRange(1, 1, shStdAbs.getLastRow(), 1)
    .createTextFinder(refAbs)
    .findAll();
  findAbs.forEach((abs) => {
    const row = abs.getRow();
    const absData = shStdAbs.getRange(row, 1, 1, 4).getValues();
    const id = absData[0][1];
    const pr = absData[0][0].split("_")[2];
    const absVal = absData[0][3];
    objStd[id][`pr${pr}`] = absVal;
  });*/

  Object.keys(chked).map((pr) => {
    chked[pr].kad.map((std) => {
      if (objStd[std]) {
        objStd[std][pr] = "ขาด";
      } //เพิ่ม if ป้องกัน error เมื่อลบนักเรียนออกจาก class แล้วข้อมูลยังอยู่ใน tchmem
    });
    chked[pr].la.map((std) => {
      if (objStd[std]) {
        objStd[std][pr] = "ลา";
      } //เพิ่ม if ป้องกัน error เมื่อลบนักเรียนออกจาก class แล้วข้อมูลยังอยู่ใน tchmem
    });
  });

  //Logger.log(JSON.stringify(objStd));
  const objResult = arrId.map((id) => {
    return objStd[id];
  });

  return JSON.stringify(objResult);
};

const getHomeroom = (objData) => {
  const { user, tdate, tclass } = objData;
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("lineuphomeroom");
  const shSumStd =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("sumStudent");
  const arrSumStd = shSumStd.getRange(3, 1, 6, 2).getValues();
  let tMemFound = {};
  arrSumStd.map(
    (cStd, i) =>
      (tMemFound[cStd[0]] = {
        key: String(i + 1),
        cStd: cStd[0],
        sumStd: cStd[1],
        kad: "",
        la: "",
        tMem: "",
      }),
  );

  const refSearch = `${tdate}`;
  const arrFound = sheet
    .getRange(1, 8, sheet.getLastRow(), 1)
    .createTextFinder(refSearch)
    .findAll();
  arrFound.map((mem) => {
    const row = mem.getRow();
    const arrData = sheet.getRange(row, 1, 1, 10).getValues()[0];
    tMemFound[arrData[3]].kad =
      String(arrData[8]) !== ""
        ? String(String(arrData[8]).split(",").length)
        : "-";
    tMemFound[arrData[3]].la =
      String(arrData[9]) !== ""
        ? String(String(arrData[9]).split(",").length)
        : "-";
    tMemFound[arrData[3]].tMem = arrData[1];
  });
  //Logger.log("tMemFound-0 \n" + JSON.stringify(tMemFound));
  const objResult = arrSumStd.map((cStd) => {
    return tMemFound[cStd[0]];
  });
  return JSON.stringify(objResult);
};

const getStdHomeroom = (objData) => {
  const { user, tdate, tclass } = objData;
  const refMem = `${tdate}_${tclass}`;
  const sheetMem =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("lineuphomeroom");
  const rngMem = sheetMem
    .getRange(1, 8, sheetMem.getLastRow(), 10)
    .createTextFinder(refMem)
    .findNext();
  let objResult = [];
  if (rngMem) {
    const row = rngMem.getRow();
    const sheetStd =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName("studentAll");
    const foundStdClass = sheetStd
      .getRange(2, 4, sheetStd.getLastRow() - 1, 1)
      .createTextFinder(tclass)
      .findAll();
    let objStd = {};
    foundStdClass.map((std, i) => {
      const row = std.getRow();
      const stdData = sheetStd.getRange(row, 7, 1, 5).getValues()[0];
      objStd[stdData[0]] = {
        key: String(i + 1),
        id: stdData[0],
        name: `${stdData[2]}${stdData[3]}  ${stdData[4]}`,
        act: "มา",
      };
    });
    const memData = sheetMem.getRange(rngMem.getRow(), 1, 1, 10).getValues()[0];
    const arrKad = memData[8] !== "" ? memData[8].split(",") : [];
    const arrLa = memData[9] !== "" ? memData[9].split(",") : [];

    arrKad.map((std) => {
      if (objStd[std]) {
        objStd[std].act = "ขาด";
      } //เพิ่ม if ป้องกัน error เมื่อลบนักเรียนออกจาก class แล้วข้อมูลยังอยู่ใน lineuphomerrom
    });
    arrLa.map((std) => {
      if (objStd[std]) {
        objStd[std].act = "ลา";
      } //เพิ่ม if ป้องกัน error เมื่อลบนักเรียนออกจาก class แล้วข้อมูลยังอยู่ใน lineuphomerrom
    });
    objResult = Object.keys(objStd).map((std) => {
      return objStd[std];
    });
  }

  return JSON.stringify(objResult);
};

const getUserData = (objData) => {
  const { user, shName } = objData;
  const userData = [
    ...JSON.parse(getSheetData(shName)).filter((usr) => {
      return usr.user === user;
    }),
  ];

  return JSON.stringify(userData);
};

const delMem = (objData) => {
  const { ref, user, shName } = objData;
  const sheetMem = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(shName);
  const col2Find = shName === "tchmem" ? 9 : 8;
  const row = sheetMem
    .getRange(1, col2Find, sheetMem.getLastRow(), 1)
    .createTextFinder(ref)
    .findNext()
    .getRow();
  sheetMem.deleteRow(row);

  return getUserData(objData);
};
const testGetTMem = () => {
  const objData = {
    user: "banpot",
    tdate: "05-02-25",
    tclass: "ม.4",
  };
  const result = getStdHomeroom(objData);
  Logger.log(result);
};

const getTypeJob = () => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("joblist");
  const dataRang = sheet.getRange(1, 1, sheet.getLastRow(), 4);
  const dataNew = dataRang.getDisplayValues();
  const heads = dataNew.shift();
  const arrJob = dataNew.map((r) =>
    heads.reduce((o, k, i) => ((o[k] = r[i] || ""), o), {}),
  );

  //Logger.log(arrJob);

  return JSON.stringify(arrJob);
};
const sendFileJob = (file, data) => {
  const { user, typeJob, memo, filename } = data;
  const folderId = "1abAYK7eFMA11A4zFc6fWG3dliPbJAc97";

  const folder = DriveApp.getFolderById(folderId);

  const contentType = file.substring(5, file.indexOf(";"));
  const bytes = Utilities.base64Decode(
    file.substr(file.indexOf("base64,") + 7),
  );
  const blob = Utilities.newBlob(
    bytes,
    contentType,
    `${user}-${typeJob}-${filename}`,
  );

  const upFile = folder.createFile(blob);
  const upFileId = upFile.getId();
  const upFileUrl = upFile.getUrl();

  const data2Rec = [
    user,
    typeJob,
    memo,
    upFileId,
    upFileUrl,
    "รอตรวจ",
    new Date(),
  ];

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("jobdb");
  const row2Up = sheet.getLastRow() + 1;
  sheet.getRange(row2Up, 1, 1, data2Rec.length).setValues([data2Rec]);

  const dataRange = sheet.getDataRange();
  const dataNew = dataRange.getDisplayValues();
  const heads = dataNew.shift();
  const obj = dataNew.map((r) =>
    heads.reduce((o, k, i) => ((o[k] = r[i] || ""), o), {}),
  );
  return JSON.stringify(obj.filter((job) => job.user === user));
};
const getSheetDataJob = (user) => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("jobdb");

  let obj = [];
  if (sheet.getLastRow() > 1) {
    const dataRange = sheet.getDataRange();
    const dataNew = dataRange.getDisplayValues();
    const heads = dataNew.shift();
    obj = dataNew.map((r) =>
      heads.reduce((o, k, i) => ((o[k] = r[i] || ""), o), {}),
    );
  }
  if (user) {
    return JSON.stringify(obj.filter((job) => job.user === user));
  }
  return JSON.stringify(obj);
};
const delDocJob = (user, fileid) => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("jobdb");
  const foundDoc = sheet
    .getRange(2, 4, sheet.getLastRow() - 1)
    .createTextFinder(fileid)
    .matchCase(true)
    .matchEntireCell(true)
    .findNext();

  if (foundDoc) {
    const docRow = foundDoc.getRow();
    const docId = sheet.getRange(docRow, 4).getValue();

    sheet.deleteRow(docRow);
    const docJob = DriveApp.getFileById(docId);
    docJob.setTrashed(true);
  }
  const dataRange = sheet.getDataRange();
  const dataNew = dataRange.getDisplayValues();
  const heads = dataNew.shift();
  const obj = dataNew.map((r) =>
    heads.reduce((o, k, i) => ((o[k] = r[i] || ""), o), {}),
  );
  return JSON.stringify(obj.filter((job) => job.user === user));
};

const getConst = (typeCons) => {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("constants");

  const foundCons = sheet
    .getRange(1, 1, sheet.getLastRow(), 1)
    .createTextFinder(typeCons)
    .matchCase(true)
    .matchEntireCell(true)
    .findNext();

  const rowVal = foundCons.getRow() + 1;
  const arrVal = sheet.getRange(rowVal, 1).getDataRegion().getValues();
  arrVal.shift();
  const heads = arrVal.shift();
  const obj = arrVal.map((r) =>
    heads.reduce((o, k, i) => ((o[k] = r[i] || ""), o), {}),
  );

  return JSON.stringify(obj);
};
const testgetcon = () => {
  const typeCons = "wrokgroup";

  Logger.log(getConst(typeCons));
};

const getTeacher = () => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("user");
  const dataRange = sheet.getDataRange();
  const arrVal = dataRange.getValues();
  arrVal.shift();
  const obj = arrVal.map((val) => {
    return { user: val[6], name: val[5], level: val[8].toString().split(",") };
  });
  // Logger.log(JSON.stringify(obj));
  return JSON.stringify(obj);
};

const getJob2Inspect = (data) => {
  const { level } = data;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("jobdb");
  let obj = [];
  if (sheet.getLastRow() > 1) {
    const dataRange = sheet.getDataRange();
    const dataNew = dataRange.getDisplayValues();
    const heads = dataNew.shift();
    obj = dataNew.map((r) =>
      heads.reduce((o, k, i) => ((o[k] = r[i] || ""), o), {}),
    );
  }
  let jobList = JSON.parse(getConst("joblist"));
  if (!level.includes("1")) {
    jobList = jobList.filter((job) => level.includes(job.inspec));
    //Logger.log(jobList);
    const typeJob = jobList.map((job) => job.job);
    //Logger.log(`typejob : ${typeJob}`);
    return JSON.stringify({
      jobData: obj.filter((job) => typeJob.includes(job.typeJob)),
      jobList: jobList,
    });
  } else {
    return JSON.stringify({ jobData: obj, jobList: jobList });
  }
};
const inspectJob = (data) => {
  let { user, level, inspect, fileid } = data;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("jobdb");
  const foundDoc = sheet
    .getRange(2, 4, sheet.getLastRow() - 1)
    .createTextFinder(fileid)
    .matchCase(true)
    .matchEntireCell(true)
    .findNext();
  if (inspect === "ตรวจผ่าน" && level.includes("1")) {
    inspect = "ส่งเรียบร้อย";
  }
  if (foundDoc) {
    const row = foundDoc.getRow();
    sheet.getRange(row, 6).setValue(inspect);
    sheet.getRange(row, 8).setValue(user);
    sheet.getRange(row, 9).setValue(new Date());
  }
  return getJob2Inspect({ level: level });
};
const saveComment = (data) => {
  const { user, pos, comm, commD, fileid } = data;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("jobdb");
  const foundDoc = sheet
    .getRange(2, 4, sheet.getLastRow() - 1)
    .createTextFinder(fileid)
    .matchCase(true)
    .matchEntireCell(true)
    .findNext();
  if (foundDoc) {
    const row = foundDoc.getRow();
    sheet.getRange(row, 10).setValue(comm);
    sheet.getRange(row, 11).setValue(commD);
  }
  return true;
};
const getSheetDataPP5 = (user = "all") => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("pp5");
  let obj = [];
  if (sheet.getLastRow() > 1) {
    const dataRange = sheet.getDataRange();
    const dataNew = dataRange.getDisplayValues();
    const heads = dataNew.shift();
    obj = dataNew.map((r) =>
      heads.reduce((o, k, i) => ((o[k] = r[i] || ""), o), {}),
    );
  }
  if (user !== "all") {
    return JSON.stringify(obj.filter((pp) => pp.user === user));
  }
  return JSON.stringify(obj);
};
//
const extractSheetId = (url) => {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
};
const putPP5 = (data) => {
  const { user, stdclass, subject, memo, fileurl } = data;
  const arrTempPP5 = JSON.parse(getConst("templatepp5"));

  try {
    const sheetPP5 = SpreadsheetApp.openByUrl(fileurl);

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("pp5");
    const fileid = sheetPP5.getId();
    if (arrTempPP5.find((pp5) => pp5.fileid === fileid)) {
      throw new Error("ไม่สามารถบันทึกไฟล์นี้ได้ เนื่องจากเป็นเทมเพลต");
    }
    const data2Rec = [
      user,
      stdclass,
      subject,
      memo,
      fileurl,
      fileid,
      new Date(),
    ];
    sheet
      .getRange(sheet.getLastRow() + 1, 1, 1, data2Rec.length)
      .setValues([data2Rec]);

    return getSheetDataPP5();
  } catch (e) {
    //throw new Error("ไม่สามารถเปิดไฟล์ได้ กรุณาตรวจสอบ URL");
    Logger.log(`Error: ${e.message}`);
  }
};
const delPP5 = (data) => {
  const { fileid, user } = data;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("pp5");
  const foundDoc = sheet
    .getRange(2, 6, sheet.getLastRow() - 1)
    .createTextFinder(fileid)
    .matchCase(true)
    .matchEntireCell(true)
    .findNext();

  if (foundDoc) {
    const docRow = foundDoc.getRow();
    sheet.deleteRow(docRow);
  }
  return getSheetDataPP5();
};
//-------------------Saraban Section-------------------//
const arrShName = [
  "repbooks",
  "sendbooks",
  "innerbooks",
  "cmdbooks",
  "annobooks",
];
const arrSubfixBook = [
  "หนังสือรับ",
  "หนังสือส่ง",
  "บันทึกข้อความ",
  "คำสั่ง",
  "ประกาศ",
];

const addNoBook = (user, type, cmdType, data) => {
  const { id, at, atdate, from, to, title, action, note, fileid, fileurl } =
    data;
  //const arrShName = ["repbooks", "sendbooks", "cmdbooks", "annobooks"];
  const data2Rec = [
    id,
    at,
    atdate,
    from,
    to,
    title,
    action,
    note,
    fileid,
    fileurl,
    user,
  ];
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
    arrShName[type],
  );
  if (cmdType == "add") {
    const row2Up = sheet.getLastRow() + 1;
    // data2Rec[0] =
    //   row2Up > 2 ? sheet.getRange(row2Up - 1, 1).getValue() + 1 || 1 : 1; //Auto gen id ป้องกันกรณี id ที่ส่งมาไม่ใช่เลขหรือซ้ำกับที่มีอยู่แล้วในชีที่ส่งต่อไป
    sheet.getRange(row2Up, 1, 1, data2Rec.length).setValues([data2Rec]);
  } else {
    const foundBook = sheet
      .getRange(2, 1, sheet.getLastRow() - 1)
      .createTextFinder(id)
      .matchCase(true)
      .matchEntireCell(true)
      .findNext();
    if (foundBook) {
      sheet
        .getRange(foundBook.getRow(), 1, 1, data2Rec.length)
        .setValues([data2Rec]);
    }
  }

  const dataRange = sheet.getDataRange();
  const dataNew = dataRange.getDisplayValues();
  const heads = dataNew.shift();
  const obj = dataNew.map((r) =>
    heads.reduce((o, k, i) => ((o[k] = r[i] || ""), o), {}),
  );
  return JSON.stringify(obj);
};
const uploadFileBook = (arrFiles, data) => {
  const { id, at, title, bookType } = data;
  //const arrShName = ["repbooks", "sendbooks", "cmdbooks", "annobooks"];
  const arrFolderId = [
    "1J3zQR-8XlXIr3rK80emq0aOZTK-Abkvc",
    "1LUhCGg4QJC7DPtRm7mem2UfE1NOBrrcK",
    "1dmN30-Hx0h5HYAKif3rbSrGH5IWfP5dM",
    "1mohfKGkRB-dJHTMXmMH4Y1IaDOByoW0Y",
    "1RngF1bIzf7zD38gI0LOt-mA01kOj_Mfk",
  ];
  const folderId = arrFolderId[bookType];

  const folder = DriveApp.getFolderById(folderId);
  let arrFileId = [];
  let arrFileUrl = [];
  arrFiles.forEach((file, i) => {
    const contentType = file.base64.substring(5, file.base64.indexOf(";"));
    const bytes = Utilities.base64Decode(
      file.base64.substr(file.base64.indexOf("base64,") + 7),
    );
    const blob = Utilities.newBlob(
      bytes,
      contentType,
      `${arrSubfixBook[bookType]}-${title}-${i + 1}`,
    );

    const upFile = folder.createFile(blob);
    arrFileId.push(upFile.getId());
    arrFileUrl.push(upFile.getUrl());
  });
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
    arrShName[bookType],
  );
  const foundBook = sheet
    .getRange(2, 1, sheet.getLastRow() - 1)
    .createTextFinder(id)
    .matchCase(true)
    .matchEntireCell(true)
    .findNext();
  if (foundBook) {
    const bookRow = foundBook.getRow();
    arrFileId = [
      ...JSON.parse(sheet.getRange(bookRow, 9).getValue() || "[]"),
      ...arrFileId,
    ];
    arrFileUrl = [
      ...JSON.parse(sheet.getRange(bookRow, 10).getValue() || "[]"),
      ...arrFileUrl,
    ];
    sheet.getRange(bookRow, 9).setValue(JSON.stringify(arrFileId));
    sheet.getRange(bookRow, 10).setValue(JSON.stringify(arrFileUrl));
    return JSON.stringify({ upFileId: arrFileId, upFileUrl: arrFileUrl });
  } else {
    throw new Error("ไม่พบข้อมูลหนังสือที่ต้องการอัปโหลดไฟล์");
  }
};
const delBook = (bookType, id) => {
  //const arrShName = ["repbooks", "sendbooks", "cmdbooks", "annobooks"];
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
    arrShName[bookType],
  );
  const foundBook = sheet
    .getRange(2, 1, sheet.getLastRow() - 1)
    .createTextFinder(id)
    .matchCase(true)
    .matchEntireCell(true)
    .findNext();
  if (foundBook) {
    const bookRow = foundBook.getRow();
    const arrId = sheet.getRange(bookRow, 9).getValue();
    if (arrId) {
      JSON.parse(arrId).forEach((fileId) => {
        const file = DriveApp.getFileById(fileId);
        file.setTrashed(true);
      });
    }
    sheet.deleteRow(bookRow);
    return getSheetData(arrShName[bookType]);
  } else {
    throw new Error("ไม่พบข้อมูลหนังสือที่ต้องการอัปโหลดไฟล์");
  }
};
//-------------------End Saraban Section--------------------

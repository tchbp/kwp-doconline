function doGet() {
  return HtmlService.createTemplateFromFile("index")
    .evaluate()
    .setTitle("KWP Doc Online")
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

function includes(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

class tranRef {
  constructor(ref) {
    this.ref = ref;
    this.refArr = ref.split("_");
  }
  get Date() {
    return this.refArr[0];
  }
  get Class() {
    return this.refArr[1];
  }
  get Day() {
    const extracDate = this.refArr[0].split("-");
    const date = new Date(
      `20${extracDate[2]}`,
      extracDate[0] - 1,
      extracDate[1],
    );
    return date.getDay();
  }
  get DayEn() {
    const dayArr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return dayArr[this.Day];
  }
  get DayTh() {
    const dayArr = [
      "อาทิตย์",
      "จันทร์",
      "อังคาร",
      "พุธ",
      "พฤหัสบดี",
      "ศุกร์",
      "เสาร์",
    ];
    return dayArr[this.Day];
  }
  get Period() {
    return this.refArr[2];
  }
}

const genKadTop10 = () => {
  const stdData = JSON.parse(getSheetData("studentAll"));

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("tchmem");
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return [];
  }
  const data = sheet.getDataRange().getDisplayValues();
  const heads = data.shift();
  const atdate = new Date().toLocaleDateString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const dataKad = [];
  data.forEach((row) => {
    const ref = row[8];
    const arrKad = row[9] !== "" ? row[9].split(",") : [];
    arrKad.forEach((kad) => {
      let indexOfKad = dataKad.findIndex((data) => data.id === kad);
      if (indexOfKad === -1) {
        const indexOfStd = stdData.findIndex(
          (std) => std["เลขประจำตัว"] === kad,
        );
        if (indexOfStd === -1) {
          return;
        }
        const nameStd = `${stdData[indexOfStd]["คำนำหน้าชื่อ"]}${stdData[indexOfStd]["ชื่อ"]} ${stdData[indexOfStd]["นามสกุล"]}`;
        const classStd = stdData[indexOfStd]["ชั้น"];
        dataKad.push({ id: kad, name: nameStd, class: classStd, ref: [] });
        indexOfKad = dataKad.length - 1;
      }
      dataKad[indexOfKad].ref.push(ref);
    });
  });
  dataKad.sort((a, b) => b.ref.length - a.ref.length);
  const dataTop10 = dataKad.slice(0, 10).map((kad) => {
    const objKadEmpty = [];
    const arrDayTh = [
      "อาทิตย์",
      "จันทร์",
      "อังคาร",
      "พุธ",
      "พฤหัสบดี",
      "ศุกร์",
      "เสาร์",
    ];
    arrDayTh.forEach((day, i) => {
      objKadEmpty.push({
        วัน: day,
      });
      [...Array(9).keys()].forEach((pr) => {
        objKadEmpty[i][`คาบ${parseInt(pr) + 1}`] = 0;
      });
    });
    const objKad = {
      id: kad.id,
      "ชื่อ-สกุล": kad.name,
      ชั้น: kad.class,
      จำนวนที่ขาด: kad.ref.length,
      รายละเอียด: objKadEmpty,
      atdate: atdate,
    };
    kad.ref.forEach((ref) => {
      const refObj = new tranRef(ref);
      const day = refObj.Day;
      const pr = refObj.Period;
      objKad.รายละเอียด[day][`คาบ${parseInt(pr) + 1}`]++;
    });
    return objKad;
  });
  const arrToSheet = dataTop10.map((obj) => {
    const objToArr = [
      obj.id,
      obj["ชื่อ-สกุล"],
      obj.ชั้น,
      obj["จำนวนที่ขาด"],
      JSON.stringify(obj.รายละเอียด),
      obj.atdate,
    ];
    return objToArr;
  });
  const sheetTop10 =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("kadtop10");
  sheetTop10
    .getRange(2, 1, arrToSheet.length, arrToSheet[0].length)
    .setValues(arrToSheet);
};
const getKadHomeRoom = (date) => {
  const hrData = JSON.parse(getSheetData("lineuphomeroom"));
  const atDate = hrData.filter((row) => row["tdate"] === date);

  const stdData = JSON.parse(getSheetData("studentAll"));

  const dataKad = atDate.map((row) => {
    const data = {};
    data.tclass = row["tclass"];
    data.kad = row["kad"] !== "" ? row["kad"].split(",") : [];
    data.stdKad = [];
    data.kad.forEach((stdId) => {
      const indexOfStd = stdData.findIndex(
        (std) => std["เลขประจำตัว"] === stdId,
      );
      if (indexOfStd !== -1) {
        data.stdKad.push(
          `${stdData[indexOfStd]["คำนำหน้าชื่อ"]}${stdData[indexOfStd]["ชื่อ"]} ${stdData[indexOfStd]["นามสกุล"]}`,
        );
      } else {
        data.stdKad.push("นักเรียนไม่อยู่ในระบบ");
      }
    });
    data.la = row["la"] !== "" ? row["la"].split(",") : [];
    data.stdLa = [];
    data.la.forEach((stdId) => {
      const indexOfStd = stdData.findIndex(
        (std) => std["เลขประจำตัว"] === stdId,
      );
      if (indexOfStd !== -1) {
        data.stdLa.push(
          `${stdData[indexOfStd]["คำนำหน้าชื่อ"]}${stdData[indexOfStd]["ชื่อ"]} ${stdData[indexOfStd]["นามสกุล"]}`,
        );
      } else {
        data.stdLa.push("นักเรียนไม่อยู่ในระบบ");
      }
    });
    return data;
  });
  return JSON.stringify(dataKad);
};
const testKadHR = () => {
  const strdate = "06-24-26";
  const dataKad = getKadHomeRoom(strdate);

  Logger.log(dataKad);
};

export function getSheetData(sheetName) {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .getSheetData(sheetName);
  });
}

export function getDataNew5(sheetName) {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        //console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .getDataNew5(sheetName);
  });
}

export const getStudentData = (stdClass) => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .getStudentData(stdClass);
  });
};

export const sendFile = (file, data) => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .sendFile(file, data);
  });
};
export const sendFileCommand = (file, data) => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .sendFileCommand(file, data);
  });
};

export const delDocCommand = (nocmd) => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .delDocCommand(nocmd);
  });
};

export const chkLogin = (objData) => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .chkLogin(objData);
  });
};

export const chPasswd = (objData) => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .chPasswd(objData);
  });
};
export const getSubj4Teach = (objData) => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .getSubj4Teach(objData);
  });
};
export const std4Teach = (objData) => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .std4Teach(objData);
  });
};
export const std4Homeroom = (objData) => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .std4Homeroom(objData);
  });
};
export const putTeachMem = (objData) => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .putTeachMem(objData);
  });
};

export const putHomeroom = (objData) => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .putHomeroom(objData);
  });
};

export const getHomeroom = (objData) => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .getHomeroom(objData);
  });
};

export const getStdHomeroom = (objData) => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .getStdHomeroom(objData);
  });
};
export const getTeachMem = (objData) => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .getTeachMem(objData);
  });
};

export const getStdAbs = (objData) => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .getStdAbs(objData);
  });
};

export const getUserData = (objData) => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .getUserData(objData);
  });
};
export const delMem = (objData) => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .delMem(objData);
  });
};
export const getTypeJob = () => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .getTypeJob();
  });
};
export const getConst = (typeCons) => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .getConst(typeCons);
  });
};
export const sendFileJob = (file, data) => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .sendFileJob(file, data);
  });
};
export function getSheetDataJob(user) {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .getSheetDataJob(user);
  });
}
export const delDocJob = (user, fileid) => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .delDocJob(user, fileid);
  });
};
export const getTeacher = () => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .getTeacher();
  });
};
export const getJob2Inspect = (data) => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .getJob2Inspect(data);
  });
};
export const inspectJob = (data) => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .inspectJob(data);
  });
};
export const saveComment = (data) => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .saveComment(data);
  });
};
export const getSheetDataPP5 = (user = "all") => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .getSheetDataPP5(user);
  });
};
export const putPP5 = (data) => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .putPP5(data);
  });
};
export const delPP5 = (data) => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .delPP5(data);
  });
};
export const addNoBook = (user, type, cmdType, data) => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .addNoBook(user, type, cmdType, data);
  });
};
export const uploadFileBook = (file, data) => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .uploadFileBook(file, data);
  });
};
export const delBook = (bookType, id) => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((res) => {
        console.log(res);
        resolve(res);
      })
      .withFailureHandler((msg) => {
        console.log(msg);
        reject(msg);
      })
      .delBook(bookType, id);
  });
};

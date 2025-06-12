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

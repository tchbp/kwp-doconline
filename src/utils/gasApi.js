export const callGas = (functionName, ...args) => {
  return new Promise((resolve, reject) => {
    if (typeof google !== 'undefined' && google.script && google.script.run) {
      if (typeof google.script.run[functionName] !== 'function') {
        const errMsg = `ไม่พบฟังก์ชัน '${functionName}' ใน Google Apps Script`;
        console.error(errMsg);
        reject(new Error(errMsg));
        return;
      }

      console.log(`[GAS CALL] Calling '${functionName}' with args:`, args);

      google.script.run
        .withSuccessHandler((res) => {
          console.log(`[GAS SUCCESS] '${functionName}' response:`, res ? (typeof res === 'string' ? res.slice(0, 50) + '...' : res) : res);
          resolve(res);
        })
        .withFailureHandler((err) => {
          console.error(`[GAS FAILURE] '${functionName}' error:`, err);
          const message =
            (err && (err.message || (typeof err === 'string' ? err : JSON.stringify(err)))) ||
            'เกิดข้อผิดพลาดในการเรียก Google Apps Script';
          reject(new Error(message));
        })[functionName](...args);
    } else {
      console.warn(`[DEV MODE] Calling GAS function '${functionName}' with args:`, args);
      reject(new Error('Google Apps Script Environment is not available (Local Dev Mode)'));
    }
  });
};
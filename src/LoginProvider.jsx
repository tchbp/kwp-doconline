import React, { useState } from "react";

const LoginContext = React.createContext();
export const LoginProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState({
    islogin: false,
    user: "",
    name: "",
    level: [0],
    advice: "",
  });
  const setLoginHandler = (objLogin) => {
    setIsLogin(objLogin);
  };
  return (
    <LoginContext.Provider
      value={{
        dataLogin: isLogin,
        setLogin: (objLogin) => setLoginHandler(objLogin),
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};
export default LoginContext;

import { fetchDataFromApi } from "@/utils/api";
import { createContext, useEffect, useState } from "react";

const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState();

  const getUser = async ()=>{
    try {
      const res = await fetchDataFromApi("me")
    setUser(res)
    } catch (error) {
      console.log(error)
      const res = await fetchDataFromApi("refresh")
      Cookies.set("404Token", res?.accessToken);
    }

  }

  useEffect(() =>{
    getUser()
  },[])

  const contextData = {
    user,
    setUser,
  };

  return (
    <UserContext.Provider value={contextData}>{children}</UserContext.Provider>
  );
};

export default UserContext

import { fetchDataFromApi } from "@/utils/api";
import Cookies from "js-cookie";
import { createContext, useEffect, useState } from "react";

const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState();

  const getUser = async ()=>{
    try {
      const res = await fetchDataFromApi("me")
      setUser(res)
    } catch (error) {
      refresh()
      console.log("error in me api",error)
    }
  }

  const refresh = async ()=>{
    try {
      const res = await fetchDataFromApi("refresh")
      Cookies.set("404Token", res?.accessToken);
    } catch (error) {
      Cookies.remove("404Token");
      console.log("error in  refresh", error);
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

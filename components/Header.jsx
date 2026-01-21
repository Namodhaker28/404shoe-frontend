"use client";
import React, { useState, useEffect, useContext } from "react";
import Wrapper from "./Wrapper";

import Link from "next/link";
import Menu from "./Menu";
import MenuMobile from "./MenuMobile";

import { IoMdHeartEmpty } from "react-icons/io";
import { BsCart } from "react-icons/bs";
import { BiMenuAltRight } from "react-icons/bi";
import { VscChromeClose } from "react-icons/vsc";
import { fetchDataFromApi } from "@/utils/api";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import UserContext from "@/context/context";
import WalletConnect from "./WalletConnect";

const Header = () => {
  const router = useRouter();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showCatMenu, setShowCatMenu] = useState(false);
  const [show, setShow] = useState("translate-y-0");
  const [lastScrollY, setLastScrollY] = useState(0);
  const [categories, setCategories] = useState(null);
  const [authState, setAuthState] = useState();

  const contextData = useContext(UserContext);
  // console.log("first page",contextData)

  // const controlNavbar = () => {
  //   if (window.scrollY > 200) {
  //     if (window.scrollY > lastScrollY && !mobileMenu) {
  //       setShow("-translate-y-[80px]");
  //     } else {
  //       setShow("shadow-sm");
  //     }
  //   } else {
  //     setShow("translate-y-0");
  //   }
  //   setLastScrollY(window.scrollY);
  // };

  // useEffect(() => {
  //   window.addEventListener("scroll", controlNavbar);
  //   return () => {
  //     window.removeEventListener("scroll", controlNavbar);
  //   };
  // }, [lastScrollY]);



  useEffect(() => {
    {
      Cookies.get("404Token") ? setAuthState("Logout") : setAuthState("Login");
    }
    fetchCategories();
  }, [router]);

  const fetchCategories = async () => {
    const res = await fetchDataFromApi("product/category/all");
    setCategories(res);
  };

  const toggleAuth = () => {
    if (Cookies.get("404Token")) Cookies.remove("404Token");
    router.push("/auth/login");
  };

  return (
    <header
      className={`w-full h-[50px] md:h-[80px] bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 backdrop-blur-xl border-b border-gray-700/50 flex items-center justify-between z-20 sticky top-0 transition-transform duration-300 shadow-lg ${show}`}>
      <Wrapper className="h-[60px] flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <img src="/logo.png" className="w-[40px] md:w-[60px] transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
          </div>
          <span className="hidden md:block text-white font-bold text-xl bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            CryptoSole
          </span>
        </Link>

        <Menu showCatMenu={showCatMenu} setShowCatMenu={setShowCatMenu} categories={categories} />

        {mobileMenu && (
          <MenuMobile
            showCatMenu={showCatMenu}
            setShowCatMenu={setShowCatMenu}
            setMobileMenu={setMobileMenu}
            categories={categories}
          />
        )}

        <div className="flex items-center gap-3 text-white">
          {/* Wallet Connect */}
          <div className="hidden md:block">
            <WalletConnect />
          </div>
          
          {/* Icon start */}
          <Link href="/wishlist">
            <div className="w-10 md:w-12 h-10 md:h-12 rounded-full flex justify-center items-center hover:bg-white/10 cursor-pointer relative transition-all duration-300 group">
              <IoMdHeartEmpty className="text-[19px] md:text-[24px] text-white group-hover:text-red-400 transition-colors" />
              {contextData?.user?.wishlist?.length > 0 && (
                <div className="h-[16px] md:h-[18px] min-w-[16px] md:min-w-[18px] rounded-full bg-gradient-to-r from-red-500 to-pink-500 absolute -top-1 -right-1 text-white text-[10px] md:text-[12px] flex justify-center items-center px-1 font-bold shadow-lg">
                  {contextData?.user?.wishlist?.length}
                </div>
              )}
            </div>
          </Link>
          {/* Icon end */}

          {/* Icon start */}
          <Link href="/cart">
            <div className="w-10 md:w-12 h-10 md:h-12 rounded-full flex justify-center items-center hover:bg-white/10 cursor-pointer relative transition-all duration-300 group">
              <BsCart className="text-[15px] md:text-[20px] text-white group-hover:text-cyan-400 transition-colors" />
              {contextData?.user?.cart?.length > 0 && (
                <div className="h-[16px] md:h-[18px] min-w-[16px] md:min-w-[18px] rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 absolute -top-1 -right-1 text-white text-[10px] md:text-[12px] flex justify-center items-center px-1 font-bold shadow-lg">
                  {contextData?.user?.cart?.length}
                </div>
              )}
            </div>
          </Link>
          
          {/* Orders Link */}
          <Link href="/orders">
            <div className="w-10 md:w-12 h-10 md:h-12 rounded-full flex justify-center items-center hover:bg-white/10 cursor-pointer relative transition-all duration-300 group">
              <svg className="w-5 h-5 text-white group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </Link>

          {/* <Link href="/auth/login" > */}
          <div
            onClick={toggleAuth}
            className="px-3 py-1.5 text-sm rounded-lg hover:bg-white/10 cursor-pointer transition-all duration-300 font-medium text-white/80 hover:text-white">
            {authState}
          </div>

          {/* </Link> */}
          {/* Icon end */}

          {/* Mobile icon start */}
          <div className="w-10 md:w-12 h-10 md:h-12 rounded-full flex md:hidden justify-center items-center hover:bg-white/10 cursor-pointer relative -mr-2 transition-all duration-300">
            {mobileMenu ? (
              <VscChromeClose className="text-[20px] text-white" onClick={() => setMobileMenu(false)} />
            ) : (
              <BiMenuAltRight className="text-[24px] text-white" onClick={() => setMobileMenu(true)} />
            )}
          </div>
          {/* Mobile icon end */}
        </div>
      </Wrapper>
    </header>
  );
};

export default Header;

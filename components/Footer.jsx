import Link from "next/link";
import React from "react";
import { FaFacebookF, FaTwitter, FaYoutube, FaInstagram } from "react-icons/fa";
import Wrapper from "./Wrapper";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700 text-white pt-14 pb-3">
      <Wrapper className="flex justify-between flex-col md:flex-row gap-[50px] md:gap-0">
        {/* LEFT START */}

        {/* LEFT END */}

        {/* RIGHT START */}
        <div className="flex gap-4 w-full justify-center align-center ">
          <div
            onClick={() =>
              window.open(
                "https://www.facebook.com/profile.php?id=100061959056928",
                "_blank"
              )
            }
            className="w-10 h-10 rounded-full bg-white/[0.25] flex items-center justify-center text-white hover:bg-white/[0.5] cursor-pointer transition-colors">
            <FaFacebookF size={20} />
          </div>
          <Link
            href="https://twitter.com/NamoDhaker28"
            className="w-10 h-10 rounded-full bg-white/[0.25] flex items-center justify-center text-white hover:bg-white/[0.5] cursor-pointer transition-colors">
            <FaTwitter size={20} />
          </Link>
          <div className="w-10 h-10 rounded-full bg-white/[0.25] flex items-center justify-center text-white hover:bg-white/[0.5] cursor-pointer transition-colors">
            <FaYoutube size={20} />
          </div>
          <div
            onClick={() =>
              window.open("https://www.instagram.com/_underrated_30/", "_blank")
            }
            className="w-10 h-10 rounded-full bg-white/[0.25] flex items-center justify-center text-white hover:bg-white/[0.5] cursor-pointer transition-colors">
            <FaInstagram size={20} />
          </div>
        </div>
        {/* RIGHT END */}
      </Wrapper>
      <Wrapper className="flex justify-between mt-10 flex-col md:flex-row gap-[10px] md:gap-0">
        {/* LEFT START */}
        <div className="text-[12px] text-white/[0.5] hover:text-white cursor-pointer text-center md:text-left">
          © 2023 Nike, Inc. All Rights Reserved
        </div>
        {/* LEFT END */}

        {/* RIGHT START */}
        <div className="flex gap-2 md:gap-5 text-center md:text-left flex-wrap justify-center">
          <div className="text-[12px] text-white/[0.5] hover:text-white cursor-pointer">
            Guides
          </div>
          <div className="text-[12px] text-white/[0.5] hover:text-white cursor-pointer">
            Terms of Sale
          </div>
          <div className="text-[12px] text-white/[0.5] hover:text-white cursor-pointer">
            Terms of Use
          </div>
          <div className="text-[12px] text-white/[0.5] hover:text-white cursor-pointer">
            Privacy Policy
          </div>
        </div>
        {/* RIGHT END */}
      </Wrapper>
    </footer>
  );
};

export default Footer;

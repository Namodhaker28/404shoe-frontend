import React from "react";
import Wrapper from "@/components/Wrapper";
import Link from "next/link";

const Failed = () => {
    return (
        <div className="min-h-[650px] flex items-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
            <Wrapper>
                <div className="max-w-[600px] rounded-xl p-6 border border-red-500/30 bg-gradient-to-br from-gray-800 to-gray-900 mx-auto flex flex-col shadow-lg">
                    <div className="text-2xl font-bold text-white mb-2">Payment failed!</div>
                    <div className="text-base mt-5 text-gray-300">
                        For any product related query, drop an email to
                    </div>
                    <div className="underline text-cyan-400">shoeshopcontact@shop.com</div>

                    <Link href="/" className="font-bold mt-5 text-cyan-400 hover:text-cyan-300 transition-colors">
                        Continue Shopping
                    </Link>
                </div>
            </Wrapper>
        </div>
    );
};

export default Failed;

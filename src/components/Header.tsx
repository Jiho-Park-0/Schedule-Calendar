"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FaBars, FaTimes } from "react-icons/fa";

const Header = () => {
  const [isNavbarOpen, setNavbarOpen] = useState(false);

  const toggleNavbar = () => {
    setNavbarOpen(!isNavbarOpen);
  };

  return (
    <header className="bg-white">
      <div className="flex justify-between items-center py-5 px-10">
        <Link href="/">
          <h1 className="text-2xl font-bold text-gray-800">스케줄러</h1>
        </Link>

        <nav className="hidden md:block">
          <ul className="flex space-x-6 text-lg text-gray-700">
            <li>
              <Link href="/cookie">쿠키</Link>
            </li>
            <li>
              <Link href="/equipment">장비</Link>
            </li>
            <li>
              <Link href="/artifact">아티팩트</Link>
            </li>
          </ul>
        </nav>

        <div className="md:hidden">
          <button onClick={toggleNavbar} aria-label="Toggle Menu">
            {isNavbarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* 네비게이션 부분 */}
      <div
        className={`overflow-hidden transition-max-height duration-300 ease-in-out bg-gray-800 bg-opacity-75 md:hidden ${
          isNavbarOpen ? "max-h-64" : "max-h-0"
        }`}
      >
        <nav className="bg-white p-5">
          <ul className="flex flex-col space-y-4 text-lg text-gray-700">
            <li>
              <Link href="/" onClick={toggleNavbar}>
                홈
              </Link>
            </li>
            <li>
              <Link href="/cookie" onClick={toggleNavbar}>
                쿠키
              </Link>
            </li>
            <li>
              <Link href="/equipment" onClick={toggleNavbar}>
                장비
              </Link>
            </li>
            <li>
              <Link href="/artifact" onClick={toggleNavbar}>
                아티팩트
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;

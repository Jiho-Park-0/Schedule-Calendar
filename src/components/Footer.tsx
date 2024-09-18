import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="md:flex justify-between items-center py-5 px-10 bg-white mt-auto">
      <p className="text-sm text-gray-500">
        Copyright © 2023 BRIX Templates | All Rights Reserved
      </p>
      <br />
      <nav>
        <ul className="flex space-x-6 text-sm text-gray-500">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/about">About</Link>
          </li>
          <li>
            <Link href="/pricing">Pricing</Link>
          </li>
          <li>
            <Link href="/contact">Contact</Link>
          </li>
        </ul>
      </nav>
      <div className="flex space-x-3 text-gray-500 text-lg">
        <span>📘</span>
        <span>🐦</span>
        <span>📸</span>
      </div>
    </footer>
  );
};

export default Footer;

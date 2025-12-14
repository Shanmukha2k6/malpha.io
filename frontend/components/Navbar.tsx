import React from 'react';
import { DownloadIcon } from './Icons';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="w-full py-4 px-6 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <Link to="/" className="flex items-center gap-3 group cursor-pointer">
        <div className="relative">
          <div className="absolute inset-0 bg-insta-gradient blur-lg opacity-40 rounded-full group-hover:opacity-80 transition duration-500"></div>
          <div className="relative bg-white p-2 rounded-full border border-slate-100 shadow-sm">
            <DownloadIcon className="w-5 h-5 text-insta-mid" />
          </div>
        </div>
        <span className="text-xl font-black tracking-tighter text-slate-900">
          Malpha<span className="text-transparent bg-clip-text bg-insta-gradient">.io</span>
        </span>
      </Link>
      <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
        <Link to="/instagram-downloader" className="hover:text-insta-mid transition-colors">Instagram Downloader</Link>
        <Link to="/facebook-downloader" className="hover:text-insta-mid transition-colors">Facebook Downloader</Link>
        <Link to="/tiktok-downloader" className="hover:text-insta-mid transition-colors">TikTok Downloader</Link>
        <Link to="/pinterest-downloader" className="hover:text-insta-mid transition-colors">Pinterest Downloader</Link>
      </div>
    </nav>
  );
};

export default Navbar;
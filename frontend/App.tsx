import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import InstagramDownloader from './pages/InstagramDownloader';
import FacebookDownloader from './pages/FacebookDownloader';
import TikTokDownloader from './pages/TikTokDownloader';
import PinterestDownloader from './pages/PinterestDownloader';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

// Placeholder for ContactUs if needed later, or just reuse Home/Privacy styled page
const ContactUs = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
      <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
      <p className="text-slate-600 mb-6">For any inquiries, please email us at support@instasaver.app</p>
      <a href="/" className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition">Go Back Home</a>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default Home is Instagram Downloader */}
        <Route path="/" element={<InstagramDownloader />} />

        {/* Specific Platform Routes */}
        <Route path="/instagram-downloader" element={<InstagramDownloader />} />
        <Route path="/facebook-downloader" element={<FacebookDownloader />} />
        <Route path="/tiktok-downloader" element={<TikTokDownloader />} />
        <Route path="/pinterest-downloader" element={<PinterestDownloader />} />

        {/* Static Pages */}
        <Route path="/terms-of-use" element={<Terms />} />
        <Route path="/privacy-policy" element={<Privacy />} />
        <Route path="/contact-us" element={<ContactUs />} />

        {/* Fallback to Home/Instagram */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

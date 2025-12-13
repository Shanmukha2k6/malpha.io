import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import InputArea from '../components/InputArea';
import ResultCard from '../components/ResultCard';
import { scrapeInstagram } from '../services/scraperService';
import { MediaData } from '../types';
import { InstagramIcon } from '../components/Icons';

const InstagramDownloader: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<MediaData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async (url: string) => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await scrapeInstagram(url);
            setResult(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "An unexpected error occurred while scraping.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-insta-purple selection:text-white pb-20 overflow-x-hidden">
            {/* Background Grid Pattern */}
            <div className="fixed inset-0 bg-grid z-0 pointer-events-none"></div>

            <Navbar />

            <main className="container mx-auto relative z-10 pb-12">
                <InputArea
                    onAnalyze={handleAnalyze}
                    loading={loading}
                    platformName="Instagram"
                    placeholder="Paste Instagram link here..."
                    Icon={InstagramIcon}
                    gradientText="bg-insta-gradient"
                    gradientButton="bg-insta-gradient"
                />

                {error && (
                    <div className="w-full max-w-md mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-center animate-in fade-in slide-in-from-top-4 shadow-sm">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        </div>
                        <p className="font-bold text-lg mb-1">Download Failed</p>
                        <p className="text-sm opacity-80 leading-relaxed">{error}</p>
                    </div>
                )}

                {result && (
                    <div className="relative mt-8">
                        <ResultCard data={result} />
                    </div>
                )}

                {!result && !loading && (
                    <div className="mt-32"></div>
                )}
            </main>

            <div className="fixed bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 z-20 flex flex-col items-center justify-between gap-3 shadow-lg">
                <div className="w-full flex flex-col md:flex-row items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                        InstaSaver © {new Date().getFullYear()}
                    </p>
                    <div className="flex items-center gap-6">
                        <Link
                            to="/privacy-policy"
                            className="text-xs font-bold text-slate-600 hover:text-insta-mid uppercase tracking-widest transition-colors hover:underline underline-offset-4"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            to="/terms-of-use"
                            className="text-xs font-bold text-slate-600 hover:text-insta-mid uppercase tracking-widest transition-colors hover:underline underline-offset-4"
                        >
                            Terms of Use
                        </Link>
                        <Link
                            to="/contact-us"
                            className="text-xs font-bold text-slate-600 hover:text-insta-mid uppercase tracking-widest transition-colors hover:underline underline-offset-4"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
                <p className="text-[10px] text-slate-400 max-w-xl mx-auto text-center leading-tight opacity-70">
                    Instasaver is not affiliated with Instagram™ and we do not host any media on our servers. All media content is delivered through its original source and belongs to their respective owners.
                </p>
            </div>
        </div>
    );
};

export default InstagramDownloader;

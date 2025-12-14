import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import InputArea from '../components/InputArea';
import ResultCard from '../components/ResultCard';
import { scrapeInstagram } from '../services/scraperService';
import { MediaData } from '../types';
import { FacebookIcon } from '../components/Icons';

const FacebookDownloader: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<MediaData | null>(null);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        document.title = "Facebook Video Downloader – Download Reels & Shorts Free | Malpha.io";

        // Update or add meta description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', 'Download Facebook Reels, Shorts, and Videos online for free with Malpha.io. Fast, secure, no watermark, works on all devices.');
    }, []);

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
        <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white pb-20 overflow-x-hidden">
            {/* Background Grid Pattern */}
            <div className="fixed inset-0 bg-grid z-0 pointer-events-none"></div>

            <Navbar />

            <main className="container mx-auto relative z-10 pb-12">
                <InputArea
                    onAnalyze={handleAnalyze}
                    loading={loading}
                    platformName="Facebook"
                    placeholder="Paste Facebook video link here..."
                    Icon={FacebookIcon}
                    gradientText="bg-gradient-to-r from-blue-600 to-blue-400"
                    gradientButton="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500"
                    bgDecorClass="bg-blue-500"
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
                    <div className="mt-12"></div>
                )}

                {/* SEO Content Section */}
                <section className="w-full max-w-4xl mx-auto px-4 py-12 bg-white rounded-3xl shadow-sm border border-slate-100 text-slate-800">
                    <article className="prose prose-slate max-w-none">
                        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">Facebook Video Downloader – Download Reels, Shorts & Videos Online</h1>
                        <p className="mb-6 leading-relaxed text-slate-600">
                            Malpha.io is a free and fast online tool that allows you to download Facebook Reels, Shorts, and Videos in high quality. With our Facebook downloader, you can easily save videos to your device and watch them offline anytime.
                        </p>
                        <p className="mb-8 font-medium text-slate-700">
                            Our tool works smoothly on Android, iPhone, iPad, PC, and Mac, without requiring any app installation or login.
                        </p>

                        <h2 className="text-2xl font-bold mb-4 text-slate-900">How to Download Videos from Facebook</h2>
                        <p className="mb-4 text-slate-600">Millions of people watch Facebook videos, Reels, and Shorts every day. However, Facebook does not provide a direct download option. With Malpha.io, downloading Facebook videos is quick and simple.</p>

                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                            <h3 className="font-bold text-lg mb-4 text-slate-800">Steps to Download Facebook Reels or Videos</h3>
                            <ol className="list-decimal list-inside space-y-3 text-slate-700">
                                <li><span className="font-semibold">Step 1:</span> Open the Facebook app or website and select the Reel, Short, or Video you want to download.</li>
                                <li><span className="font-semibold">Step 2:</span> Tap on the three dots and copy the video link.</li>
                                <li><span className="font-semibold">Step 3:</span> Open <span className="text-blue-600">https://malpha.io/facebook</span> in your browser.</li>
                                <li><span className="font-semibold">Step 4:</span> Paste the copied link into the input box.</li>
                                <li><span className="font-semibold">Step 5:</span> Click on the “Download” button.</li>
                            </ol>
                            <p className="mt-4 text-green-600 font-medium">✅ Done! Your Facebook video will be saved directly to your device gallery.</p>
                        </div>

                        <h2 className="text-2xl font-bold mb-4 text-slate-900">How Facebook Downloader Works</h2>
                        <p className="mb-4 text-slate-600">
                            The Facebook Downloader by Malpha.io works by processing publicly available Facebook video links. Once you paste the URL, our system fetches the video and provides a direct download option in high quality.
                        </p>
                        <ul className="list-disc list-inside mb-8 text-slate-700 space-y-1 ml-4">
                            <li>No watermark.</li>
                            <li>No signup required.</li>
                            <li>100% browser-based.</li>
                        </ul>

                        <h2 className="text-2xl font-bold mb-4 text-slate-900">Facebook Downloader Features</h2>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                            {[
                                "Download Facebook Reels, Shorts, and Videos",
                                "Supports HD video quality",
                                "Works on Android, iOS, Windows, and macOS",
                                "No software or app installation required",
                                "Unlimited free downloads",
                                "Simple and user-friendly interface",
                                "No login or personal data required"
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-2 text-slate-700">
                                    <span className="text-green-500 font-bold">✔</span> {feature}
                                </li>
                            ))}
                        </ul>

                        <h2 className="text-2xl font-bold mb-4 text-slate-900">Download Facebook Reels & Shorts Online</h2>
                        <p className="mb-4 text-slate-600">
                            Facebook Reels is a short-video feature similar to Instagram Reels. Users can create engaging videos using music, text, effects, and AR filters. With Malpha.io, you can easily download Facebook Reels and Shorts and save your favorite videos for offline viewing.
                        </p>
                        <p className="mb-8 text-slate-600">
                            Our Facebook Reels Downloader helps you download videos in just a few seconds using the video link.
                        </p>

                        <div className="bg-amber-50 border-l-4 border-amber-400 p-6 mb-8 rounded-r-xl">
                            <h3 className="text-amber-800 font-bold text-lg mb-2">⚠️ Important Note</h3>
                            <p className="text-amber-700 mb-2">
                                Downloading Facebook content without the permission of the original owner may violate Facebook’s terms of service. Please ensure that you only download:
                            </p>
                            <ul className="list-disc list-inside text-amber-700 ml-4">
                                <li>Content you own</li>
                                <li>Content you have permission to use</li>
                                <li>Content available under a Creative Commons license</li>
                            </ul>
                        </div>

                        <div className="border-t border-slate-200 pt-8 mt-8">
                            <h3 className="text-xl font-bold mb-3 text-slate-800">DMCA Compliance</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Malpha.io complies with 17 U.S.C. § 512 and the Digital Millennium Copyright Act (DMCA).
                                If you believe that your copyrighted content is available on our website and wish to have it removed, please contact us with a valid DMCA notice. We will take appropriate action promptly.
                            </p>
                        </div>
                    </article>
                </section>
            </main>

            <div className="fixed bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 z-20 flex flex-col items-center justify-between gap-3 shadow-lg">
                <div className="w-full flex flex-col md:flex-row items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                        Malpha.io © {new Date().getFullYear()}
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
                    Malpha.io is not affiliated with Facebook™ and we do not host any media on our servers. All media content is delivered through its original source and belongs to their respective owners.
                </p>
            </div>
        </div>
    );
};

export default FacebookDownloader;

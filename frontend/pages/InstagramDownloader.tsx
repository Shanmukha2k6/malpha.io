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

    React.useEffect(() => {
        document.title = "Instagram Reels Downloader – Download Reels Online Free | Malpha.io";

        // Update or add meta description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', 'Download Instagram Reels videos online for free using Malpha.io. Fast, secure, no watermark, no login required. Save Reels in HD quality.');
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
                    <div className="mt-12"></div>
                )}

                {/* SEO Content Section */}
                <section className="w-full max-w-4xl mx-auto px-4 py-12 bg-white rounded-3xl shadow-sm border border-slate-100 text-slate-800">
                    <article className="prose prose-slate max-w-none">
                        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">Instagram Reels Downloader – Download Reels Online Free</h1>
                        <p className="mb-6 leading-relaxed text-slate-600">
                            Malpha.io is a free, fast, and easy-to-use online tool that helps you download Instagram Reels videos and save them directly to your device. You can download any public Instagram Reel in original quality and watch it offline anytime on your phone, tablet, or computer.
                        </p>
                        <p className="mb-8 font-medium text-slate-700">
                            No login required. No watermark. 100% online.
                        </p>

                        <h2 className="text-2xl font-bold mb-4 text-slate-900">How to Download Reels from Instagram</h2>
                        <p className="mb-4 text-slate-600">Downloading Instagram Reels using Malpha.io is quick and simple. Just follow these easy steps:</p>

                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                            <h3 className="font-bold text-lg mb-4 text-slate-800">Step-by-Step Guide</h3>
                            <ol className="list-decimal list-inside space-y-3 text-slate-700">
                                <li><span className="font-semibold">Step 1:</span> Open Instagram and choose the Reel video you want to download.</li>
                                <li><span className="font-semibold">Step 2:</span> Tap on the three dots and copy the Reels video link.</li>
                                <li><span className="font-semibold">Step 3:</span> Open <span className="text-blue-600">https://malpha.io</span> in your browser.</li>
                                <li><span className="font-semibold">Step 4:</span> Paste the copied URL into the input box.</li>
                                <li><span className="font-semibold">Step 5:</span> Click on the “Download Video” button to save the Reel to your device.</li>
                            </ol>
                            <p className="mt-4 text-green-600 font-medium">That’s it! Your Reel video will be downloaded in seconds.</p>
                        </div>

                        <h2 className="text-2xl font-bold mb-4 text-slate-900">How Instagram Reels Downloader Works</h2>
                        <p className="mb-4 text-slate-600">
                            An Instagram Reels Downloader is an online tool that allows users to download Instagram Reels, videos, photos, and posts by simply entering the media URL.
                        </p>
                        <p className="mb-8 text-slate-600">
                            Malpha.io processes the public Instagram link and provides a direct download in high quality — without watermark or logo.
                        </p>

                        <h2 className="text-2xl font-bold mb-4 text-slate-900">Key Features of Malpha.io</h2>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                            {[
                                "Download Instagram Reels in original quality",
                                "No watermark or branding on downloaded videos",
                                "Works on Android, iPhone, iPad, PC, Mac, and tablets",
                                "Download reels directly using your browser",
                                "No app installation required",
                                "Completely free to use",
                                "Unlimited downloads",
                                "No login or personal information needed"
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-2 text-slate-700">
                                    <span className="text-green-500 font-bold">✔</span> {feature}
                                </li>
                            ))}
                        </ul>

                        <h2 className="text-2xl font-bold mb-4 text-slate-900">Why Choose Malpha.io?</h2>
                        <p className="mb-4 text-slate-600">
                            Malpha.io is designed to be fast, lightweight, and reliable. Our Instagram Reels downloader fetches videos within seconds and lets you save them directly to your device gallery.
                        </p>
                        <p className="mb-8 text-slate-600">
                            Whether you want to save Reels for offline viewing or personal reference, Malpha.io makes the process smooth and hassle-free.
                        </p>

                        <h2 className="text-2xl font-bold mb-4 text-slate-900">Download Instagram Reels Online in HD</h2>
                        <p className="mb-4 text-slate-600">
                            Watching Reels on Instagram is easy, but downloading them is not supported directly by Instagram. With Malpha.io, you can download Instagram Reels videos online in HD MP4 format without any technical knowledge.
                        </p>
                        <p className="mb-4 text-slate-600">Our web-based tool supports multiple formats such as:</p>
                        <ul className="list-disc list-inside mb-8 text-slate-700 space-y-1 ml-4">
                            <li><span className="font-semibold">MP4</span> (Video)</li>
                            <li><span className="font-semibold">JPG</span> (Image)</li>
                            <li><span className="font-semibold">MP3</span> (Audio – when available)</li>
                        </ul>

                        <div className="bg-amber-50 border-l-4 border-amber-400 p-6 mb-8 rounded-r-xl">
                            <h3 className="text-amber-800 font-bold text-lg mb-2">⚠️ Important Note</h3>
                            <p className="text-amber-700 mb-2">
                                Downloading Instagram content without the permission of the content owner may violate Instagram’s terms of service. You should only download content that:
                            </p>
                            <ul className="list-disc list-inside text-amber-700 ml-4">
                                <li>You own</li>
                                <li>You have permission to use</li>
                                <li>Is available under a Creative Commons license</li>
                            </ul>
                        </div>

                        <div className="border-t border-slate-200 pt-8 mt-8">
                            <h3 className="text-xl font-bold mb-3 text-slate-800">DMCA Compliance</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Malpha.io complies with 17 U.S.C. § 512 and the Digital Millennium Copyright Act (DMCA).
                                If your copyrighted material appears on this website and you want it removed, please contact us with a valid DMCA notice. We take copyright protection seriously and respond promptly to infringement requests.
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
                    Malpha.io is not affiliated with Instagram™ and we do not host any media on our servers. All media content is delivered through its original source and belongs to their respective owners.
                </p>
            </div>
        </div>
    );
};

export default InstagramDownloader;

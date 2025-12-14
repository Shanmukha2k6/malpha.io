import React from 'react';
import { MediaData, MediaType } from '../types';
import { DownloadIcon, UserIcon, FilmIcon, MusicIcon } from './Icons';

interface ResultCardProps {
    data: MediaData;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ResultCard: React.FC<ResultCardProps> = ({ data }) => {

    const [downloading, setDownloading] = React.useState<Record<number, boolean>>({});

    const handleDownload = async (mediaUrlOverride?: string, index: number = 0) => {
        try {
            setDownloading(prev => ({ ...prev, [index]: true }));

            let ext = 'jpg';
            let targetUrl = mediaUrlOverride || data.mediaUrl;

            // Determine extension
            if (targetUrl.includes('.mp4')) ext = 'mp4';
            else if (data.type === MediaType.REEL) ext = 'mp4';
            else if (data.type === MediaType.AUDIO) ext = 'mp3';

            const suffix = index !== undefined ? `_${index + 1}` : '';
            const filename = `malpha_${data.username || 'user'}_${data.id || Date.now()}${suffix}.${ext}`;

            // Generate proxy URL
            const downloadUrl = `${API_BASE_URL}/api/download?url=${encodeURIComponent(targetUrl)}&filename=${encodeURIComponent(filename)}`;

            // Use fetch to get the blob (handles errors better)
            const response = await fetch(downloadUrl);
            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download error:', error);
            alert('Download failed. Please try again.');
        } finally {
            setDownloading(prev => ({ ...prev, [index]: false }));
        }
    };

    const getIcon = (type?: MediaType) => {
        const t = type || data.type;
        switch (t) {
            case MediaType.PROFILE: return <UserIcon className="w-5 h-5" />;
            case MediaType.REEL: return <FilmIcon className="w-5 h-5" />;
            case MediaType.AUDIO: return <MusicIcon className="w-5 h-5" />;
            default: return <FilmIcon className="w-5 h-5" />;
        }
    }

    const sources = data.sources && data.sources.length > 0 ? data.sources : [{ uri: data.mediaUrl, title: 'Media' }];
    const isCarousel = sources.length > 1;

    const renderMediaItem = (url: string, index: number) => {
        // IMPROVED TYPE DETECTION
        // Check extension in URL (ignoring query params)
        const cleanUrl = url.split('?')[0].toLowerCase();
        const hasVideoExt = cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.mov');

        // Check if data type explicitly says REEL or VIDEO
        // Also check if the source title explicitly says "Video" (set by backend)
        const isItemVideo = hasVideoExt ||
            data.type === MediaType.REEL ||
            data.type === 'VIDEO' ||
            (data.sources && data.sources[index]?.title && data.sources[index].title.toLowerCase().includes('video'));

        const proxyUrl = `${API_BASE_URL}/api/download?url=${encodeURIComponent(url)}&inline=true`;

        return (
            <div key={index} className="flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 w-fit mx-auto max-w-full min-w-[320px]">
                <div className="relative group flex items-center justify-center bg-slate-50 overflow-hidden">
                    {isItemVideo ? (
                        <video
                            src={proxyUrl}
                            controls
                            className="block max-h-[70vh] w-auto max-w-full object-contain"
                            playsInline
                            loop
                            crossOrigin="anonymous"
                        >
                            Your browser does not support the video tag.
                        </video>
                    ) : (data.type === MediaType.AUDIO) ? (
                        <div className="w-[320px] py-12 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 h-[320px]">
                            <div className="relative w-32 h-32 rounded-full border-4 border-slate-700 shadow-2xl overflow-hidden animate-[spin_10s_linear_infinite] mb-6">
                                <img src={data.thumbnailUrl} alt="Album Art" className="w-full h-full object-cover" />
                            </div>
                            <audio controls src={proxyUrl} className="w-full max-w-[80%]" crossOrigin="anonymous"></audio>
                        </div>
                    ) : (
                        <img
                            src={proxyUrl}
                            alt={`Slide ${index + 1}`}
                            className="block max-h-[70vh] w-auto max-w-full object-contain"
                        />
                    )}

                    {index === 0 && (
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider border border-white/10 shadow-lg pointer-events-none z-10">
                            {getIcon()}
                            {isCarousel ? 'Carousel' : data.type}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-white border-t border-slate-100">
                    <button
                        onClick={() => handleDownload(url, index)}
                        className={`w-full ${downloading[index] ? 'bg-slate-700 cursor-not-allowed' : 'bg-slate-900 hover:bg-black'} text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors transform active:scale-95 shadow-lg shadow-slate-900/20`}
                        disabled={downloading[index]}
                    >
                        <DownloadIcon className={`w-5 h-5 ${downloading[index] ? 'animate-bounce' : ''}`} />
                        {downloading[index] ? 'Downloading...' : `Download ${isCarousel ? `Item ${index + 1}` : 'Media'}`}
                    </button>
                    {isCarousel && (
                        <p className="text-xs text-center text-slate-400 mt-3 font-medium">
                            Item {index + 1} of {sources.length}
                        </p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-6xl mx-auto mt-12 px-4 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            <div className={`
                ${isCarousel ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'w-full flex justify-center'}
             `}>
                {sources.map((source, index) => renderMediaItem(source.uri, index))}
            </div>

        </div>
    );
};

export default ResultCard;
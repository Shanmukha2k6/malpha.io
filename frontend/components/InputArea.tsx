import React, { useState, useRef } from 'react';
import { SearchIcon, PasteIcon, FilmIcon, MusicIcon, UserIcon, InstagramIcon } from './Icons';

interface InputAreaProps {
  onAnalyze: (url: string) => void;
  loading: boolean;
  platformName?: string;
  placeholder?: string;
  Icon?: React.ElementType;
  gradientText?: string;
  gradientButton?: string;
  bgDecorClass?: string;
}

const InputArea: React.FC<InputAreaProps> = ({
  onAnalyze,
  loading,
  platformName = 'Instagram',
  placeholder = 'Paste Instagram link here...',
  Icon = InstagramIcon,
  gradientText = 'bg-insta-gradient',
  gradientButton = 'bg-insta-gradient',
  bgDecorClass = 'bg-insta-gradient'
}) => {
  const [input, setInput] = useState('');
  const [pasteMessage, setPasteMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [progress, setProgress] = useState(0);

  // Simulated progress effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setProgress(10); // Start

      // Step 1: Jump to 50% quickly
      const t1 = setTimeout(() => setProgress(50), 500);

      // Step 2: Jump to 75%
      const t2 = setTimeout(() => setProgress(75), 1500);

      // Step 3: Jump to 90% (stall here)
      const t3 = setTimeout(() => setProgress(90), 2500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else {
      setProgress(100);
    }
  }, [loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      let finalInput = input.trim();

      // Simple heuristic for Instagram, can be made generic later if needed
      if (platformName === 'Instagram' && !finalInput.includes('instagram.com') && !finalInput.includes('/') && !finalInput.includes('http')) {
        finalInput = `https://www.instagram.com/${finalInput.replace('@', '')}/`;
      }

      onAnalyze(finalInput);
    }
  };

  const handlePaste = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        throw new Error("Clipboard API not supported");
      }
      const text = await navigator.clipboard.readText();
      setInput(text);
      setPasteMessage(null);
    } catch (err) {
      console.warn('Clipboard auto-paste failed:', err);
      setPasteMessage("Ctrl+V to paste");
      inputRef.current?.focus();
      setTimeout(() => setPasteMessage(null), 3000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-16 md:mt-24 px-4 flex flex-col items-center relative z-10">

      {/* Background Decor */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] ${bgDecorClass} opacity-5 blur-[100px] rounded-full -z-10 pointer-events-none`}></div>

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-500 mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          System Online & Ready
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-[1.1] text-slate-900">
          Download from
          <br />
          <span className={`bg-clip-text text-transparent ${gradientText} bg-[length:200%_auto]`}>
            {platformName}
          </span>
          <span className="text-slate-900"> Instantly.</span>
        </h1>
        <p className="text-slate-500 text-lg md:text-xl max-w-xl mx-auto font-light">
          The fastest way to save content from {platformName} in original quality. No login required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-2xl relative group z-20">
        <div className={`absolute -inset-0.5 ${gradientButton} rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-500 ${isFocused ? 'opacity-80 blur-md' : ''}`}></div>

        <div className="relative flex items-center bg-white border border-slate-200 rounded-xl p-2 shadow-xl transition-all duration-300">
          <div className={`pl-4 pr-3 transition-colors duration-300 ${isFocused ? 'text-slate-800' : 'text-slate-400'}`}>
            <Icon className="w-6 h-6" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={`flex-1 bg-transparent border-none outline-none text-slate-900 text-lg placeholder-slate-400 py-4 transition-colors font-medium ${pasteMessage ? 'placeholder-red-400' : ''}`}
            disabled={loading}
          />

          <div className="flex items-center gap-3 pr-2">
            {!input && (
              <button
                type="button"
                onClick={handlePaste}
                className="hidden md:flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-all hover:scale-105 active:scale-95"
                title="Paste from clipboard"
              >
                <PasteIcon className="w-3 h-3" />
                PASTE
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={`
                h-12 px-8 rounded-lg font-bold text-white transition-all duration-300 flex items-center justify-center shadow-lg
                ${loading || !input.trim()
                  ? 'bg-slate-300 cursor-not-allowed text-slate-500 shadow-none'
                  : `${gradientButton} hover:shadow-[0_0_20px_rgba(0,0,0,0.2)] transform hover:scale-105 active:scale-95`}
              `}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="flex items-center gap-2">
                  DOWNLOAD
                </span>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Progress Bar when loading */}
      <div className={`w-full max-w-2xl mt-6 transition-all duration-500 overflow-hidden ${loading ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0'}`}>
        <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider px-1">
          <span>Looking up media...</span>
          <span className="text-slate-700">{progress}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className={`h-full ${gradientButton} transition-all duration-300 ease-out rounded-full shadow-sm`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Helper message for manual paste */}
      <div className={`mt-3 h-6 text-center transition-all duration-300 ${pasteMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
        <p className="text-red-500 text-xs font-bold uppercase tracking-widest bg-red-100 inline-block px-3 py-1 rounded-full">
          {pasteMessage}
        </p>
      </div>

      {platformName === 'Instagram' && (
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <FeatureBadge icon={<FilmIcon className="w-4 h-4" />} label="Reels" color="text-insta-purple bg-insta-purple/10" />
          <FeatureBadge icon={<MusicIcon className="w-4 h-4" />} label="Audio" color="text-insta-mid bg-insta-mid/10" />
          <FeatureBadge icon={<UserIcon className="w-4 h-4" />} label="Profiles" color="text-insta-blue bg-insta-blue/10" />
          <FeatureBadge icon={<SearchIcon className="w-4 h-4" />} label="Stories" color="text-insta-start bg-insta-start/10" />
        </div>
      )}
    </div>
  );
};

const FeatureBadge = ({ icon, label, color }: { icon: React.ReactNode, label: string, color: string }) => (
  <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group cursor-default select-none shadow-sm">
    <div className={`p-1.5 rounded-full ${color} group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900">{label}</span>
  </div>
)

export default InputArea;
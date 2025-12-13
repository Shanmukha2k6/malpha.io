import React, { useEffect } from 'react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Prevent scroll on body when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Terms of Use</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Last updated: September 13th, 2025</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto text-slate-600 space-y-8 text-sm leading-relaxed custom-scrollbar">
            
            <Section title="1. Acceptance of Terms">
                By using this application, you agree to these Terms. If you don't agree, don't use the service. You must be legally capable of entering into binding contracts.
            </Section>

            <Section title="2. Service Description">
                <p className="mb-2">This tool is a technical application that:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Extracts links from online media elements</li>
                    <li>Provides download functionality for various file types</li>
                    <li>Acts solely as a technical service provider</li>
                    <li>Does NOT host or store content</li>
                    <li>Does NOT grant rights to downloaded content</li>
                </ul>
            </Section>

            <Section title="3. Your Legal Responsibility">
                <p className="mb-2 font-semibold text-slate-800">You are 100% responsible for:</p>
                <ul className="list-disc pl-5 space-y-1 mb-4">
                    <li>Ensuring downloads are legal in your country</li>
                    <li>Checking copyright status before downloading</li>
                    <li>Obtaining necessary permissions/licenses</li>
                    <li>Complying with all local and international laws</li>
                    <li>Fair use determination in your jurisdiction</li>
                </ul>
                <p className="mb-2 font-semibold text-slate-800">You agree that:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>You have the right to download the content</li>
                    <li>You're using the service for personal, fair use only</li>
                    <li>You won't infringe on any copyrights or intellectual property</li>
                    <li>You understand laws vary by country/region</li>
                </ul>
            </Section>

            <Section title="4. Prohibited Uses">
                 <p className="mb-2">You may NOT:</p>
                 <ul className="list-disc pl-5 space-y-1">
                    <li>Download copyrighted content without permission</li>
                    <li>Use the service for commercial purposes without rights</li>
                    <li>Download content that violates any laws</li>
                    <li>Bypass DRM or other protection measures</li>
                    <li>Redistribute downloaded content illegally</li>
                    <li>Use the service for piracy or copyright infringement</li>
                    <li>Violate terms of the source websites</li>
                 </ul>
            </Section>

            <Section title="5. Intellectual Property Warning">
                <ul className="list-disc pl-5 space-y-1">
                    <li>Copyright infringement can result in legal action</li>
                    <li>Illegal downloads harm content creators</li>
                    <li>Penalties may include fines and criminal prosecution</li>
                    <li>We don't verify the copyright status of content</li>
                    <li>You assume all risks of downloading</li>
                </ul>
            </Section>

            <Section title="6. User Identification (UID)">
                 <p className="mb-2 font-semibold text-slate-800">How it works:</p>
                 <ul className="list-disc pl-5 space-y-1 mb-4">
                    <li>Anonymous unique identifier (UID) generated locally</li>
                    <li>No personal information required</li>
                    <li>UID used only for credit tracking</li>
                    <li>You control your UID completely</li>
                    <li>Can regenerate anytime (loses existing credits)</li>
                 </ul>
                 <p className="mb-2 font-semibold text-slate-800">Privacy-first approach:</p>
                 <ul className="list-disc pl-5 space-y-1">
                    <li>No email or registration needed</li>
                    <li>UID not linked to personal data</li>
                    <li>Completely anonymous system</li>
                 </ul>
            </Section>

            <Section title="7. Credits & Purchases">
                 <p className="mb-2 font-semibold text-slate-800">Credit System:</p>
                 <ul className="list-disc pl-5 space-y-1 mb-4">
                    <li>Purchase credits using your UID</li>
                    <li>Credits tied to UID only</li>
                    <li>No expiration on credits</li>
                    <li>Non-transferable between UIDs</li>
                 </ul>
                 <p className="mb-2 font-semibold text-slate-800">Payments:</p>
                 <ul className="list-disc pl-5 space-y-1">
                    <li>Processed by secure third-party providers</li>
                    <li>We only store UID and credit balance</li>
                    <li>No payment information retained</li>
                 </ul>
            </Section>

            <Section title="8. Refund Policy">
                 <p className="mb-2 font-semibold text-slate-800">3-Day Money-Back Guarantee:</p>
                 <ul className="list-disc pl-5 space-y-1 mb-4">
                    <li>Full refund within 3 days of purchase</li>
                    <li>No questions asked</li>
                    <li>Contact support with UID and transaction ID</li>
                    <li>Refund processed through original payment method</li>
                 </ul>
                 <p className="mb-2 font-semibold text-slate-800">After 3 days:</p>
                 <ul className="list-disc pl-5 space-y-1">
                    <li>Case-by-case review for technical issues</li>
                    <li>No refunds for change of mind</li>
                    <li>Credits remain valid indefinitely</li>
                 </ul>
            </Section>

             <Section title="9. User Responsibilities">
                 <p className="mb-2">Before downloading, you must:</p>
                 <ul className="list-disc pl-5 space-y-1">
                    <li>Verify you have the legal right</li>
                    <li>Check source website's terms of service</li>
                    <li>Ensure compliance with local laws</li>
                    <li>Understand fair use limitations</li>
                    <li>Accept full legal responsibility</li>
                 </ul>
            </Section>

            <Section title="10. Service Limitations">
                 <ul className="list-disc pl-5 space-y-1">
                    <li>Service provided “AS IS” with no guarantees</li>
                    <li>May not work with all websites</li>
                    <li>No warranty of availability or functionality</li>
                    <li>Download quality depends on source</li>
                    <li>We don't control third-party content</li>
                 </ul>
            </Section>

            <Section title="11. Disclaimer of Liability">
                 <p className="mb-2 font-semibold text-slate-800">InstaSave:</p>
                 <ul className="list-disc pl-5 space-y-1 mb-4">
                    <li>Is NOT responsible for your downloads</li>
                    <li>Does NOT endorse any content</li>
                    <li>Cannot verify content legality</li>
                    <li>Is NOT liable for copyright violations</li>
                    <li>Provides service without warranties</li>
                 </ul>
                 <p className="mb-2 font-semibold text-slate-800">You agree to:</p>
                 <ul className="list-disc pl-5 space-y-1">
                    <li>Indemnify us from any legal claims</li>
                    <li>Take full responsibility for your actions</li>
                    <li>Not hold us liable for any damages</li>
                    <li>Accept all risks of using the service</li>
                 </ul>
            </Section>

            <Section title="12. Data & Privacy">
                 <ul className="list-disc pl-5 space-y-1">
                    <li>We process URLs you submit temporarily</li>
                    <li>No permanent storage of your data</li>
                    <li>No user accounts required</li>
                    <li>UID system ensures anonymity</li>
                    <li>See Privacy Policy for full details</li>
                 </ul>
            </Section>

            <Section title="13. DMCA Compliance">
                 <ul className="list-disc pl-5 space-y-1">
                    <li>We respond to valid DMCA notices</li>
                    <li>Report violations to: hello@instasave.app</li>
                    <li>Repeat infringers may be blocked</li>
                    <li>We cooperate with legal authorities</li>
                 </ul>
            </Section>

            <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-red-900">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    14. Final Warning
                </h3>
                <p className="font-semibold mb-2">BY USING THIS SERVICE YOU ACKNOWLEDGE:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Full understanding of copyright laws</li>
                    <li>Complete responsibility for your downloads</li>
                    <li>Risk of legal consequences for violations</li>
                    <li>Service is used entirely at your own risk</li>
                </ul>
            </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end">
            <button onClick={onClose} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/10">
                I Understand & Agree
            </button>
        </div>

      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string, children?: React.ReactNode }) => (
    <section>
        <h3 className="font-bold text-slate-900 text-lg mb-3">{title}</h3>
        <div className="text-slate-600">{children}</div>
    </section>
);

export default TermsModal;
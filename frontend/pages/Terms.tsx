import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Terms: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 overflow-x-hidden">
            <Navbar />

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors text-sm font-bold uppercase tracking-wider">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    Back to Home
                </Link>

                <div className="bg-white rounded-2xl shadow-xl w-full flex flex-col animate-in slide-in-from-bottom-4 duration-300 overflow-hidden border border-slate-100">
                    {/* Header */}
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">Terms of Use</h1>
                        <p className="text-sm text-slate-500 font-medium">Last updated: September 13th, 2025</p>
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-12 text-slate-600 space-y-10 text-base leading-relaxed">

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

                        <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-red-900 mt-12">
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
                </div>
            </div>
        </div>
    );
};

const Section = ({ title, children }: { title: string, children?: React.ReactNode }) => (
    <section>
        <h3 className="font-bold text-slate-900 text-xl mb-4">{title}</h3>
        <div className="text-slate-600">{children}</div>
    </section>
);

export default Terms;

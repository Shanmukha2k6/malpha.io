import React, { useEffect } from 'react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
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
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Privacy Policy</h2>
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
        <div className="p-6 overflow-y-auto text-slate-600 space-y-6 text-sm leading-relaxed custom-scrollbar">
            
            <p>At InstaSave, accessible from https://instasave.app, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by InstaSave and how we use it.</p>
            
            <p>If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.</p>
            
            <p>This Privacy Policy applies only to our online activities and is valid for visitors to our website with regards to the information that they shared and/or collect in InstaSave. This policy is not applicable to any information collected offline or via channels other than this website.</p>

            <Section title="Consent">
                By using our website, you hereby consent to our Privacy Policy and agree to its terms.
            </Section>

            <Section title="Information we collect">
                <p className="mb-2">The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.</p>
                <p className="mb-2">If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.</p>
                <p>When you register for an Account, we may ask for your contact information, including items such as name, company name, address, email address, and telephone number.</p>
            </Section>

            <Section title="How we use your information">
                <p className="mb-2">We use the information we collect in various ways, including to:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Provide, operate, and maintain our website</li>
                    <li>Improve, personalize, and expand our website</li>
                    <li>Understand and analyze how you use our website</li>
                    <li>Develop new products, services, features, and functionality</li>
                    <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes</li>
                    <li>Send you emails</li>
                    <li>Find and prevent fraud</li>
                </ul>
            </Section>

            <Section title="Log Files">
                 <p>InstaSave follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users movement on the website, and gathering demographic information.</p>
            </Section>

            <Section title="Cookies and Web Beacons">
                <p>Like any other website, InstaSave uses cookies. These cookies are used to store information including visitors preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users experience by customizing our web page content based on visitors browser type and/or other information.</p>
            </Section>

            <Section title="Google DoubleClick DART Cookie">
                 <p>Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our site and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-insta-blue hover:underline">https://policies.google.com/technologies/ads</a></p>
            </Section>

            <Section title="Our Advertising Partners">
                 <p className="mb-2">Some of advertisers on our site may use cookies and web beacons. Our advertising partners are listed below. Each of our advertising partners has their own Privacy Policy for their policies on user data.</p>
                 <ul className="list-disc pl-5 space-y-1">
                    <li>Google: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-insta-blue hover:underline">https://policies.google.com/technologies/ads</a></li>
                 </ul>
            </Section>

            <Section title="Third Party Privacy Policies">
                 <p className="mb-2">InstaSave's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.</p>
                 <p>You can choose to disable cookies through your individual browser options. To know more detailed information about cookie management with specific web browsers, it can be found at the browsers respective websites.</p>
            </Section>

            <Section title="CCPA Privacy Rights (Do Not Sell My Personal Information)">
                 <p className="mb-2">Under the CCPA, among other rights, California consumers have the right to:</p>
                 <ul className="list-disc pl-5 space-y-1 mb-2">
                    <li>Request that a business that collects a consumer's personal data disclose the categories and specific pieces of personal data that a business has collected about consumers.</li>
                    <li>Request that a business delete any personal data about the consumer that a business has collected.</li>
                    <li>Request that a business that sells a consumer's personal data, not sell the consumer's personal data.</li>
                 </ul>
                 <p>If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.</p>
            </Section>

            <Section title="GDPR Data Protection Rights">
                 <p className="mb-2">We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:</p>
                 <ul className="list-disc pl-5 space-y-1 mb-2">
                    <li>The right to access – You have the right to request copies of your personal data. We may charge you a small fee for this service.</li>
                    <li>The right to rectification – You have the right to request that we correct any information you believe is inaccurate. You also have the right to request that we complete the information you believe is incomplete.</li>
                    <li>The right to erasure – You have the right to request that we erase your personal data, under certain conditions.</li>
                    <li>The right to restrict processing – You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
                    <li>The right to object to processing – You have the right to object to our processing of your personal data, under certain conditions.</li>
                    <li>The right to data portability – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
                 </ul>
                 <p>If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.</p>
            </Section>

            <Section title="Children's Information">
                 <p className="mb-2">Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.</p>
                 <p>InstaSave does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.</p>
            </Section>

            <Section title="Changes to This Privacy Policy">
                 <p>We may update our Privacy Policy from time to time. Thus, we advise you to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page. These changes are effective immediately, after they are posted on this page.</p>
            </Section>

            <Section title="Contact Us">
                 <p>If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us.</p>
            </Section>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end">
            <button onClick={onClose} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/10">
                Close
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

export default PrivacyModal;
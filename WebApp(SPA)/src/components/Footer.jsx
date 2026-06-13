import { ShieldAlert, HelpCircle, PhoneCall } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-900 bg-slate-950 text-slate-400 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
        {/* Left section: Sri Lankan policy align */}
        <div className="text-center md:text-left space-y-2 max-w-md">
          <div className="flex items-center justify-center md:justify-start space-x-2 text-slate-200">
            <img 
              src="https://img.icons8.com/color/24/sri-lanka-circular.png" 
              alt="Sri Lanka Emblem" 
              className="h-5 w-5" 
            />
            <span className="font-semibold text-sm tracking-wider font-display">eTFMS Digitalization Project</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Aligning with the national policy of modernizing and strengthening public services through digitalization. Developed for the Sri Lanka Police Department.
          </p>
        </div>

        {/* Right section: Support links */}
        <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-500">
          <a href="#" className="flex items-center space-x-1 hover:text-slate-300 transition-colors">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Rules & Regulations</span>
          </a>
          <a href="#" className="flex items-center space-x-1 hover:text-slate-300 transition-colors">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>FAQs</span>
          </a>
          <a href="#" className="flex items-center space-x-1 hover:text-slate-300 transition-colors">
            <PhoneCall className="h-3.5 w-3.5" />
            <span>Emergency Support (+94 11 2433333)</span>
          </a>
        </div>
      </div>
      <div className="mt-8 text-center text-[10px] text-slate-600 border-t border-slate-900/50 pt-4">
        &copy; {new Date().getFullYear()} Sri Lanka Police Department. All rights reserved. Secure SSL Encrypted.
      </div>
    </footer>
  );
}

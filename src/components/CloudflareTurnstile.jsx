import React, { useState, useEffect } from 'react';

const CloudflareTurnstile = ({ onVerify }) => {
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success'

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus('success');
      if (onVerify) {
        onVerify(true);
      }
    }, 1500); // 1.5 seconds verification time

    return () => clearTimeout(timer);
  }, [onVerify]);

  return (
    <div className="w-full max-w-[300px] h-[65px] bg-[#fafafa] dark:bg-[#12131a] border border-[#d6d6d6] dark:border-[#2a2c3a] rounded-[3px] px-3.5 flex items-center justify-between text-xs font-sans shadow-sm select-none transition-all duration-300">
      
      {/* Left side: Status Indicator */}
      <div className="flex items-center space-x-3.5">
        {status === 'verifying' ? (
          <>
            {/* Spinning/pulsing custom loading indicator */}
            <div className="relative w-7 h-7 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-green-500/20 border-t-green-600 rounded-full animate-spin"></div>
            </div>
            <span className="text-gray-500 dark:text-gray-400 font-normal text-[13px]">
              Verifying...
            </span>
          </>
        ) : (
          <>
            {/* Success checkmark */}
            <div className="w-7 h-7 rounded-full bg-[#1b7e4c] dark:bg-[#10b981] flex items-center justify-center text-white transition-all duration-500 scale-100">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-gray-800 dark:text-gray-100 font-semibold text-[14px]">
              Success!
            </span>
          </>
        )}
      </div>

      {/* Right side: Cloudflare Branding */}
      <div className="flex flex-col items-end justify-center h-full pt-1.5 pb-1">
        <div className="flex flex-col items-center select-none">
          {/* Cloudflare logo icon (precise official paths) */}
          <svg viewBox="0 0 256 116" className="w-[32px] h-[14.5px] text-[#f38020]" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fill="#F4811F" d="M176.332 108.348c1.593-5.31 1.062-10.622-1.593-13.809-2.656-3.187-6.374-5.31-11.154-5.842L71.17 87.634c-.531 0-1.062-.53-1.593-.53-.531-.532-.531-1.063 0-1.594.531-1.062 1.062-1.594 2.124-1.594l92.946-1.062c11.154-.53 22.839-9.56 27.087-20.182l5.312-13.809c0-.532.531-1.063 0-1.594C191.203 20.182 166.772 0 138.091 0 111.535 0 88.697 16.995 80.73 40.896c-5.311-3.718-11.684-5.843-19.12-5.31-12.747 1.061-22.838 11.683-24.432 24.43-.531 3.187 0 6.374.532 9.56C16.996 70.107 0 87.103 0 108.348c0 2.124 0 3.718.531 5.842 0 1.063 1.062 1.594 1.594 1.594h170.489c1.062 0 2.125-.53 2.125-1.594l1.593-5.842Z"/>
            <path fill="#FAAD3F" d="M205.544 48.863h-2.656c-.531 0-1.062.53-1.593 1.062l-3.718 12.747c-1.593 5.31-1.062 10.623 1.594 13.809 2.655 3.187 6.373 5.31 11.153 5.843l19.652 1.062c.53 0 1.062.53 1.593.53.53.532.53 1.063 0 1.594-.531 1.063-1.062 1.594-2.125 1.594l-20.182 1.062c-11.154.53-22.838 9.56-27.087 20.182l-1.063 4.78c-.531.532 0 1.594 1.063 1.594h70.108c1.062 0 1.593-.531 1.593-1.593 1.062-4.25 2.124-9.03 2.124-13.81 0-27.618-22.838-50.456-50.456-50.456"/>
          </svg>
          <span className="text-[7.5px] font-black tracking-[0.14em] text-gray-900 dark:text-gray-100 uppercase -mt-0.5 font-sans">
            CLOUDFLARE
          </span>
        </div>
        
        {/* Links: Privacy and Help */}
        <div className="text-[9px] text-[#4d4d4d] dark:text-[#999] mt-0.5 space-x-1 flex items-center font-normal">
          <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-black dark:hover:text-white">
            Privacy
          </a>
          <span>•</span>
          <a href="https://www.cloudflare.com/website-terms-of-use/" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-black dark:hover:text-white">
            Help
          </a>
        </div>
      </div>
      
    </div>
  );
};

export default CloudflareTurnstile;

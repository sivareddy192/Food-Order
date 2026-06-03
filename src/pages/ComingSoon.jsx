import React from 'react';
import { Link } from 'react-router-dom';

const ComingSoon = ({ title, subtitle }) => {
  return (
    <div className="container mx-auto px-6 py-24 min-h-[60vh] flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 bg-luxury-green-dark/5 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl">✨</span>
      </div>
      <h1 className="text-3xl lg:text-5xl font-black text-luxury-green-dark mb-4 font-luxury-serif uppercase tracking-widest">{title}</h1>
      <p className="text-gray-500 max-w-md mx-auto mb-8 font-luxury-sans leading-relaxed">{subtitle}</p>
      <Link to="/" className="bg-luxury-gold hover:bg-[#d4af37] text-luxury-green-dark px-8 py-3 rounded-full font-black uppercase tracking-widest transition-colors shadow-sm">
        Continue Shopping
      </Link>
    </div>
  );
};

export default ComingSoon;

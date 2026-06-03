import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import { FaStar, FaShoppingCart, FaLeaf, FaMedal, FaFire, FaShieldAlt } from 'react-icons/fa';
import { getImageUrl } from '../utils/getImageUrl';

const LandingPage = () => {
  const [landingPageData, setLandingPageData] = useState(null);
  const [liveTestimonials, setLiveTestimonials] = useState([]);
  const user = useSelector(state => state.user);
  const navigate = useNavigate();

  // If user is logged in, redirect them to /home automatically
  useEffect(() => {
    if (user && user._id) {
      navigate('/home');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchLandingPage = async () => {
      try {
        const [res, reviewsRes] = await Promise.all([
          Axios(SummaryApi.getLandingPage),
          Axios(SummaryApi.review_live_testimonials)
        ]);

        if (res.data?.success) {
          setLandingPageData(res.data.data);
        }
        if (reviewsRes.data?.success) {
          setLiveTestimonials(reviewsRes.data.data);
        }
      } catch (error) {
        console.error("Error loading landing page:", error);
      }
    };
    fetchLandingPage();
  }, []);

  if (!landingPageData) {
    return <div className="min-h-screen bg-[#0A2A1A] flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="w-full flex flex-col font-luxury-sans">
      
      {/* 1. HERO SECTION */}
      <section className="bg-[#0A2A1A] w-full min-h-[80vh] flex flex-col md:flex-row items-center px-6 md:px-16 lg:px-24 py-16 relative overflow-hidden">
        <div className="w-full md:w-3/5 z-10 space-y-6">
          {landingPageData.hero.badgeText && (
            <div className="inline-flex items-center gap-2 border border-[#faf9f6]/20 bg-white/5 backdrop-blur-sm rounded-full px-4 py-1.5 text-orange-400 text-[10px] font-bold uppercase tracking-widest">
               <FaLeaf /> <span>{landingPageData.hero.badgeText}</span>
            </div>
          )}
          
          <h1 className="font-luxury-serif text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1]">
            {landingPageData.hero.titlePart1} <br/>
            <span className="text-[#D47A15]">{landingPageData.hero.titlePart2}</span>
          </h1>
          
          <p className="text-[#e2e8f0] text-sm md:text-base max-w-lg leading-relaxed opacity-90">
            {landingPageData.hero.description}
          </p>
          
          <div className="flex items-center gap-4 pt-4">
            <button 
              onClick={() => navigate('/home')}
              className="bg-[#D47A15] hover:bg-[#b06511] text-white px-6 cursor-pointer py-3 rounded text-sm font-bold tracking-wider uppercase transition-colors flex items-center gap-2"
            >
              <FaShoppingCart /> Explore Shop
            </button>
            <button 
              onClick={() => navigate('/home')}
              className="border border-white/30 cursor-pointer text-white px-6 py-3 rounded text-sm font-bold tracking-wider uppercase hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <FaLeaf /> Our Story
            </button>
          </div>
        </div>

        {/* 3D Glassmorphism Product Card */}
        <div className="w-full md:w-2/5 mt-16 md:mt-0 flex justify-center z-10 relative">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-dashed border-[#D47A15]/20 rounded-full animate-[spin_60s_linear_infinite]" />
           
           <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center text-center shadow-2xl shadow-black/50 relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br from-[#D47A15]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <img src={getImageUrl(landingPageData.hero.cardImage) || "/mango.png"} alt="Aura Avakaya" className="w-32 h-32 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500 mb-6" onError={(e) => { e.target.style.display='none' }} />
              
              <h3 className="font-luxury-serif text-2xl text-white font-bold mb-1">{landingPageData.hero.cardTitle}</h3>
              <p className="text-[#D47A15] text-[10px] font-bold uppercase tracking-[0.2em] mb-4">{landingPageData.hero.cardSubtitle}</p>
              <div className="flex gap-1 text-[#D47A15]">
                {[...Array(landingPageData.hero.cardRating || 5)].map((_, i) => <FaStar key={i} size={14} />)}
              </div>
           </div>
        </div>
      </section>

      {/* 2. FEATURES STRIP */}
      {landingPageData.features?.length > 0 && (
        <section className="bg-[#F9F6F0] border-b border-[#e5e0d8] py-10 px-6 md:px-16 lg:px-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">
            {landingPageData.features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-[#ede9e1] text-[#0A2A1A] flex items-center justify-center shrink-0">
                   {idx === 0 ? <FaMedal size={20} /> : idx === 1 ? <FaFire size={20} /> : <FaShieldAlt size={20} />}
                 </div>
                 <div>
                   <h4 className="font-luxury-serif text-lg font-bold text-[#0A2A1A] mb-0.5">{feat.title}</h4>
                   <p className="text-gray-500 text-xs leading-tight">{feat.description}</p>
                 </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. ABOUT SECTION */}
      <section className="bg-[#F9F6F0] py-20 px-6 md:px-16 lg:px-24 flex flex-col md:flex-row gap-12 items-center">
         <div className="w-full md:w-1/2">
            <div 
              className="relative aspect-4/3 rounded-2xl overflow-hidden bg-linear-to-t from-[#4f5c53] to-transparent flex items-end p-8 shadow-xl bg-cover bg-center"
              style={landingPageData.about?.image ? { backgroundImage: `url(${getImageUrl(landingPageData.about.image)})` } : {}}
            >
               {/* Dark overlay to ensure text readability if there's an image */}
               {landingPageData.about?.image && <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />}
               <div className="relative z-10">
                 <p className="text-[#D47A15] text-[10px] font-bold tracking-[0.2em] uppercase mb-2">{landingPageData.about.tag}</p>
                 <h3 className="font-luxury-serif text-white text-2xl font-bold">{landingPageData.about.imageTitle}</h3>
               </div>
            </div>
         </div>
         <div className="w-full md:w-1/2">
            <h2 className="font-luxury-serif text-4xl text-[#0A2A1A] font-bold mb-4">{landingPageData.about.title}</h2>
            <div className="w-16 h-1 bg-[#D47A15] mb-8" />
            <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
              {landingPageData.about.paragraphs?.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
            <button 
              onClick={() => navigate('/home')}
              className="mt-8 bg-[#0A2A1A] cursor-pointer hover:bg-[#15422d] text-white px-6 py-3 rounded text-sm font-bold tracking-wider transition-colors"
            >
              Browse Our Jars
            </button>
         </div>
      </section>

      {/* 4. TESTIMONIALS SECTION */}
      {liveTestimonials?.length > 0 && (
        <section className="bg-[#0A2A1A] py-20 overflow-hidden flex flex-col items-center">
          <p className="text-[#D47A15] text-[10px] font-bold tracking-[0.2em] uppercase mb-3">Verified Relish</p>
          <h2 className="font-luxury-serif text-4xl text-white font-bold mb-12">What Pickle Lovers Say</h2>
          
          <div className="relative w-full max-w-[100vw] overflow-hidden flex group">
            <style>{`
              @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .animate-marquee {
                animation: marquee 35s linear infinite;
              }
              .group:hover .animate-marquee {
                animation-play-state: paused;
              }
            `}</style>
            
            <div className="flex w-max animate-marquee gap-6 px-3">
              {[...liveTestimonials, ...liveTestimonials, ...liveTestimonials, ...liveTestimonials].map((test, idx) => (
                <div key={idx} className="bg-[#0B281A] border border-[#D47A15]/10 hover:border-[#D47A15]/30 transition-colors rounded-3xl p-8 flex flex-col shadow-xl w-[350px] shrink-0">
                  <div className="flex gap-1 text-[#D47A15] mb-6">
                    {[...Array(test.rating || 5)].map((_, i) => <FaStar key={i} size={14} />)}
                  </div>
                  <p className="text-gray-300 text-sm italic leading-relaxed mb-8 grow line-clamp-4">
                    "{test.comment}"
                  </p>
                  <div className="flex items-center gap-4">
                    {/* Animated Avatar */}
                    <div className="relative w-12 h-12 rounded-full shrink-0">
                      {/* Pulsing glow effect behind avatar */}
                      <div className="absolute inset-0 rounded-full border border-[#D47A15] animate-ping opacity-40"></div>
                      <img 
                        src={`https://ui-avatars.com/api/?name=${test.userName}&background=D47A15&color=fff&bold=true`} 
                        alt={test.userName} 
                        className="w-full h-full rounded-full object-cover relative z-10 border border-[#D47A15]/50 shadow-[0_0_15px_rgba(212,122,21,0.2)]" 
                      />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">{test.userName}</h4>
                      <p className="text-[#D47A15] text-[10px] uppercase tracking-wider mt-0.5">Verified Customer</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
};

export default LandingPage;

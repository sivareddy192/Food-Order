import React, { useState } from 'react'
import { FaFacebookSquare, FaTwitter, FaYoutube } from "react-icons/fa";
import { FaSquareInstagram } from "react-icons/fa6";
import { IoLogoLinkedin } from "react-icons/io5";
import { Link } from 'react-router-dom';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';

const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.submitContact,
        data: {
          name: "Newsletter Subscriber",
          email: email,
          message: `Newsletter Subscription Request: Please add ${email} to the newsletter subscription list.`
        }
      });

      if (response.data.success) {
        toast.success("Thank you for subscribing!");
        setEmail("");
      } else {
        toast.error(response.data.message || "Subscription failed.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className='bg-luxury-green-dark border-t border-luxury-gold/20 pt-16 pb-28 lg:pb-10 mt-12 text-[#faf9f6]/95 font-luxury-sans overflow-hidden'>
      <div className='container mx-auto px-6 lg:px-12'>
        
        {/* Top Section: Multi-Column Layout */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16'>
          
          {/* Brand & Description */}
          <div className="flex flex-col gap-4">
            <Link to="/" className='text-luxury-gold font-black text-2xl uppercase tracking-[0.2em] font-luxury-serif hover:text-[#d4af37] transition-colors w-fit'>
              PICKLE
            </Link>
            <p className='text-xs text-[#faf9f6]/70 leading-loose max-w-xs'>
              Experience the pinnacle of culinary excellence with our curated selection of premium organic groceries, sourced from the finest farms worldwide.
            </p>
          </div>

          {/* Links Inner Grid for Side-by-Side on Mobile */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-2">
            {/* Quick Links */}
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-black text-sm uppercase tracking-widest mb-2 font-luxury-serif">Discover</h4>
              <Link to="/new-arrivals" className="text-xs text-[#faf9f6]/70 hover:text-luxury-gold transition-colors w-fit">New Arrivals</Link>
              <Link to="/best-sellers" className="text-xs text-[#faf9f6]/70 hover:text-luxury-gold transition-colors w-fit">Best Sellers</Link>
              <Link to="/wishlist" className="text-xs text-[#faf9f6]/70 hover:text-luxury-gold transition-colors w-fit">My Wishlist</Link>
              <Link to="/gift-cards" className="text-xs text-[#faf9f6]/70 hover:text-luxury-gold transition-colors w-fit">Gift Cards</Link>
            </div>

            {/* Support */}
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-black text-sm uppercase tracking-widest mb-2 font-luxury-serif">Support</h4>
              <Link to="/contact" className="text-xs text-[#faf9f6]/70 hover:text-luxury-gold transition-colors w-fit">Contact Us</Link>
              <Link to="/shipping-returns" className="text-xs text-[#faf9f6]/70 hover:text-luxury-gold transition-colors w-fit">Shipping & Returns</Link>
              <Link to="/faq" className="text-xs text-[#faf9f6]/70 hover:text-luxury-gold transition-colors w-fit">FAQ</Link>
              <Link to="/privacy" className="text-xs text-[#faf9f6]/70 hover:text-luxury-gold transition-colors w-fit">Privacy Policy</Link>
            </div>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-black text-sm uppercase tracking-widest mb-2 font-luxury-serif">Newsletter</h4>
            <p className='text-[11px] text-[#faf9f6]/70 leading-relaxed mb-1'>
              Subscribe to receive exclusive offers and luxury culinary inspiration.
            </p>
            <form className="flex flex-col sm:flex-row gap-2" onSubmit={handleSubscribe}>
              <input 
                type="email" 
                placeholder="Your email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#0a2e1c] border border-[#145736] text-white px-4 py-3 rounded-xl text-xs outline-none focus:border-luxury-gold transition-colors flex-1 placeholder:text-[#faf9f6]/40"
              />
              <button 
                type="submit" 
                disabled={loading}
                className="bg-luxury-gold hover:bg-[#d4af37] text-luxury-green-dark font-black px-6 py-3 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-luxury-gold/20 mb-8"></div>

        {/* Bottom Section: Copyright & Socials */}
        <div className='flex flex-col md:flex-row md:justify-between items-center gap-6'>
          
          <div className="flex items-center gap-4 text-[10.5px] text-[#faf9f6]/50">
            <p>© 2026 Pickle Luxury Grocery.</p>
            <span className="w-1 h-1 rounded-full bg-[#faf9f6]/30"></span>
            <Link to="/terms" className="hover:text-luxury-gold transition-colors">Terms of Service</Link>
          </div>

          <div className='flex items-center gap-6 text-xl'>
            <a href='#facebook' className='text-luxury-gold hover:text-[#d4af37] hover:scale-110 hover:-translate-y-1 transition-all duration-300'>
              <FaFacebookSquare />
            </a>
            <a href='#instagram' className='text-luxury-gold hover:text-[#d4af37] hover:scale-110 hover:-translate-y-1 transition-all duration-300'>
              <FaSquareInstagram />
            </a>
            <a href='#linkedin' className='text-luxury-gold hover:text-[#d4af37] hover:scale-110 hover:-translate-y-1 transition-all duration-300'>
              <IoLogoLinkedin />
            </a>
            <a href='#twitter' className='text-luxury-gold hover:text-[#d4af37] hover:scale-110 hover:-translate-y-1 transition-all duration-300'>
              <FaTwitter />
            </a>
            <a href='#youtube' className='text-luxury-gold hover:text-[#d4af37] hover:scale-110 hover:-translate-y-1 transition-all duration-300'>
              <FaYoutube />
            </a>
          </div>
          
        </div>
      </div>
    </footer>
  )
}

export default Footer

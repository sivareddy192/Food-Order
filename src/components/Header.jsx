import React, { useEffect, useState, useRef } from 'react'
import Search from './Search'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useMobile from '../hooks/useMobile';
import { FaCartArrowDown } from "react-icons/fa6";
import {useSelector} from 'react-redux'
import { GoTriangleDown } from "react-icons/go";
import { FaRegUserCircle } from "react-icons/fa";
import UserMenu from './UserMenu';
import { getImageUrl } from '../utils/getImageUrl';
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';

import { useGlobalContext } from '../provider/GlobalProvider';
import DisplayCartItem from './DisplayCartItem';


const Header = () => {
  const [isMobile]=useMobile()
  const location = useLocation()
  const isSearchP = location.pathname ==="/search"
  const navigate = useNavigate()
  const user = useSelector((state)=>state?.user)
  const [openUserMenu,setOpenUserMenu]=useState(false)
  const {totalPrice,totalQty} = useGlobalContext()
  const cartItem =useSelector(state => state.cartItem.cart)
  const [openCartSection, setOpenCartSection] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setOpenUserMenu(false);
      }
    };

    if (openUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openUserMenu]);

  const redirectToLoginPage = ()=>{
    navigate("/login")
  }
  
  const handleCloseUserMenu =()=>{
    setOpenUserMenu(false)
  }

  const handleMobileUser=()=>{
    if(!user._id){
      navigate('/login')
      return
    }
    navigate('/user-menu')
  }


  return (
    <>
      <header className='h-28 lg:h-20 bg-white/80 backdrop-blur-xl fixed top-0 w-full z-50 flex flex-col justify-center border-b border-luxury-gold/20 shadow-premium transition-colors duration-300'>
        <div className='container mx-auto px-4'>
          <div className='flex items-center justify-between h-14 lg:h-20 gap-4'>
            
            {/* Logo Section */}
            <Link to={"/"} className='shrink-0 flex items-center gap-2 group active:scale-95 transition-transform'>
                <div className='flex items-center gap-2.5'>
                  <svg className="w-8 h-8 lg:w-9 lg:h-9" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="luxury-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0e3e26" />
                        <stop offset="100%" stopColor="#0a845c" />
                      </linearGradient>
                      <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#d4af37" />
                        <stop offset="100%" stopColor="#c5a880" />
                      </linearGradient>
                    </defs>
                    <rect width="100" height="100" rx="30" fill="url(#luxury-grad)" />
                    <circle cx="50" cy="50" r="32" stroke="url(#gold-grad)" strokeWidth="4" fill="none" />
                    <path d="M52 35C44.5 35 38.5 41 38.5 48C38.5 55 44.5 61 52 61C59.5 61 65.5 55 65.5 48C65.5 41 59.5 35 52 35Z" fill="url(#gold-grad)"/>
                    <path d="M48 54L41 47L43.5 44.5L48 49L57.5 39.5L60 42L48 54Z" fill="#0e3e26"/>
                  </svg>
                  <div className="flex flex-col">
                    <span className="text-xl lg:text-2xl font-black text-gray-900 tracking-wider leading-none font-luxury-serif uppercase">PICKLE</span>
                    <span className="text-[7.5px] font-black text-luxury-gold uppercase tracking-[0.25em] leading-none mt-1.5 font-luxury-sans">Premium Grocery</span>
                  </div>
                </div>
            </Link>

            {/* Desktop Search */}
            <div className='hidden lg:block flex-1 max-w-xl'>
              <Search/>
            </div>

            {/* Right Actions */}
            <div className='flex items-center gap-3 lg:gap-6'>
                
                {/* Mobile User Icon Only */}
                <div className='flex lg:hidden items-center gap-4'>
                    <button onClick={handleMobileUser} className='text-gray-900 overflow-hidden'>
                        {user?._id && user?.avatar ? (
                            <img 
                                src={getImageUrl(user.avatar)} 
                                alt={user.name} 
                                className='w-10 h-10 rounded-full object-cover border border-luxury-gold/30 shadow-sm transition-transform active:scale-90'
                            />
                        ) : (
                            <div className='w-10 h-10 rounded-full bg-gray-55 dark:bg-neutral-800 flex items-center justify-center text-gray-400 dark:text-gray-500 border border-gray-100'>
                                <FaRegUserCircle size={24} />
                            </div>
                        )}
                    </button>
                </div>

                {/* Desktop User Menu */}
                <div className='hidden lg:flex items-center gap-6 min-w-[120px] justify-end'>
                  {/* Desktop Cart Button */}
                    <button onClick={() => setOpenCartSection(true)} className='flex items-center cursor-pointer gap-4 bg-luxury-green-gradient text-white px-5.5 py-2.5 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-premium border border-luxury-green/30 hover:shadow-luxury-green/10'>
                        <div className='flex flex-col items-start'>
                            <span className='text-[9px] font-black uppercase tracking-widest opacity-80 font-luxury-sans'>{totalQty || 0} Items</span>
                            <span className='text-xs font-black font-luxury-sans tracking-wide'>{totalPrice ? DisplayPriceInRupees(totalPrice) : 'My Cart'}</span>
                        </div>
                        <div className='h-8 w-px bg-white/20' />
                        <FaCartArrowDown size={18} className="text-luxury-gold" />
                    </button>
                    {user?._id ? (
                        <div className='relative lg:-mr-20' ref={userMenuRef}>
                            <div onClick={()=>setOpenUserMenu(prev => !prev)} className='flex items-center gap-3 cursor-pointer group bg-gray-50/50 hover:bg-gray-50/80 px-3.5 py-1.5 rounded-2xl transition-all border border-gray-100/40 hover:border-luxury-gold/30'>
                                {user.avatar ? (
                                    <img 
                                        alt={user.name}
                                        src={getImageUrl(user.avatar)}
                                        className='w-11 h-11 rounded-full object-cover border-2 border-white dark:border-neutral-700 group-hover:scale-105 transition-all shadow-2xs'
                                    />
                                ) : (
                                    <div className='w-11 h-11 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-gray-400 dark:text-gray-500 border-2 border-white dark:border-neutral-700 shadow-2xs'>
                                        <FaRegUserCircle size={22} />
                                    </div>
                                )}
                                <div className='flex flex-col lg:-mr-3 leading-tight'>
                                    <span className='text-[8.5px] font-black text-gray-400 uppercase tracking-widest font-luxury-sans'>Account</span>
                                    <div className='flex items-center gap-1'>
                                        <p className='text-xs font-black text-gray-900 truncate max-w-[100px] font-luxury-sans'>{user.name || "User"}</p>
                                        <div className={`transition-transform duration-200 ${openUserMenu ? 'rotate-180' : ''}`}>
                                            <GoTriangleDown size={11} className='text-gray-400'/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {openUserMenu && (
                                <div className='absolute right-0 top-16 w-64 animate-in fade-in slide-in-from-top-2 duration-200'>
                                    <UserMenu close={handleCloseUserMenu}/>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button onClick={redirectToLoginPage} className='font-black text-xs uppercase tracking-widest text-gray-900 hover:text-luxury-green transition-colors font-luxury-sans'>Login</button>
                    )}
                </div>
            </div>
          </div>

          {/* Mobile Search - Bottom of Header */}
          <div className='lg:hidden pb-4'>
            <Search />
          </div>
      </div>
      </header>

      {/* Cart Drawer */}
      {openCartSection && (
        <DisplayCartItem close={() => setOpenCartSection(false)} />
      )}
    </>
  )
}

export default Header

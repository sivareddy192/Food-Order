import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaHeart } from 'react-icons/fa';
import { FaCartShopping, FaGear } from 'react-icons/fa6';
import { useSelector } from 'react-redux';
import { useGlobalContext } from '../provider/GlobalProvider';
import { motion } from 'framer-motion';

const BottomNavigationBar = () => {
    const location = useLocation();
    const { totalQty } = useGlobalContext();
    const user = useSelector(state => state.user);
    const wishlistCount = useSelector(state => state.wishlist?.items?.length || 0);

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/' || location.pathname === '/home';
        return location.pathname.startsWith(path);
    };

    const isSettingsActive = isActive('/user-menu') || isActive('/dashboard');
    const settingsPath = user?._id ? '/user-menu' : '/login';

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border-t border-gray-100 dark:border-neutral-800 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-100 pb-safe transition-colors duration-300">
            <div className="flex items-center justify-around h-20 px-2">
                
                {/* Home Tab */}
                <Link to="/" className="flex-1 flex flex-col items-center justify-center gap-1.5 group transition-colors h-full">
                    <div className="relative p-2.5 rounded-2xl flex items-center justify-center active:scale-90 z-10">
                        {isActive('/') && (
                            <motion.div
                                layoutId="activeMobileTabBubble"
                                className="absolute inset-0 bg-green-50 dark:bg-green-900/20 rounded-2xl -z-10"
                                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                            />
                        )}
                        <FaHome size={24} className={`transition-all duration-300 ${isActive('/') ? 'scale-110 text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-neutral-500 group-hover:text-gray-900 dark:group-hover:text-neutral-200'}`} />
                    </div>
                    <span className={`text-[10px] font-black tracking-widest uppercase transition-all ${isActive('/') ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-neutral-500'}`}>
                        Home
                    </span>
                </Link>

                {/* Wishlist Tab */}
                <Link to="/wishlist" className="flex-1 flex flex-col items-center justify-center gap-1.5 group transition-colors h-full">
                    <div className="relative p-2.5 rounded-2xl flex items-center justify-center active:scale-90 z-10">
                        {isActive('/wishlist') && (
                            <motion.div
                                layoutId="activeMobileTabBubble"
                                className="absolute inset-0 bg-red-50 dark:bg-red-900/20 rounded-2xl -z-10"
                                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                            />
                        )}
                        <FaHeart size={24} className={`transition-all duration-300 ${isActive('/wishlist') ? 'scale-110 text-red-500' : 'text-gray-400 dark:text-neutral-500 group-hover:text-red-500'}`} />
                        {wishlistCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white animate-in zoom-in shadow-sm">
                                {wishlistCount > 99 ? '99+' : wishlistCount}
                            </span>
                        )}
                    </div>
                    <span className={`text-[10px] font-black tracking-widest uppercase transition-all ${isActive('/wishlist') ? 'text-red-500' : 'text-gray-400 dark:text-neutral-500'}`}>
                        Wishlist
                    </span>
                </Link>

                {/* Cart Tab */}
                <Link to="/cart" className="flex-1 flex flex-col items-center justify-center gap-1.5 group transition-colors h-full">
                    <div className="relative p-2.5 rounded-2xl flex items-center justify-center active:scale-90 z-10">
                        {isActive('/cart') && (
                            <motion.div
                                layoutId="activeMobileTabBubble"
                                className="absolute inset-0 bg-green-50 dark:bg-green-900/20 rounded-2xl -z-10"
                                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                            />
                        )}
                        <FaCartShopping size={24} className={`transition-all duration-300 ${isActive('/cart') ? 'scale-110 text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-neutral-500 group-hover:text-gray-900 dark:group-hover:text-neutral-200'}`} />
                        {totalQty > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white animate-in zoom-in shadow-sm">
                                {totalQty > 99 ? '99+' : totalQty}
                            </span>
                        )}
                    </div>
                    <span className={`text-[10px] font-black tracking-widest uppercase transition-all ${isActive('/cart') ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-neutral-500'}`}>
                        Cart
                    </span>
                </Link>

                {/* Settings/Account Tab */}
                <Link to={settingsPath} className="flex-1 flex flex-col items-center justify-center gap-1.5 group transition-colors h-full">
                    <div className="relative p-2.5 rounded-2xl flex items-center justify-center active:scale-90 z-10">
                        {isSettingsActive && (
                            <motion.div
                                layoutId="activeMobileTabBubble"
                                className="absolute inset-0 bg-green-50 dark:bg-green-900/20 rounded-2xl -z-10"
                                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                            />
                        )}
                        <FaGear size={24} className={`transition-all duration-300 ${isSettingsActive ? 'scale-110 rotate-45 text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-neutral-500 group-hover:text-gray-900 dark:group-hover:text-neutral-200'}`} />
                    </div>
                    <span className={`text-[10px] font-black tracking-widest uppercase transition-all ${isSettingsActive ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-neutral-500'}`}>
                        Settings
                    </span>
                </Link>
            </div>
        </nav>
    );
};

export default BottomNavigationBar;

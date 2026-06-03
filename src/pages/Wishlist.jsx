import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { removeFromWishlist, clearWishlist } from '../store/wishlistSlice'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import { pricewithDiscount } from '../utils/PriceWithDiscount'
import { valideURLConvert } from '../utils/valideURLConvert'
import { getImageUrl } from '../utils/getImageUrl'
import AddToCartButton from '../components/AddToCartButton'
import { FaHeart, FaTrash } from 'react-icons/fa'
import { IoHeartDislike } from 'react-icons/io5'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const Wishlist = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const wishlistItems = useSelector(state => state.wishlist.items)
  const user = useSelector(state => state.user)
  const [removing, setRemoving] = useState(null)

  const handleRemove = (item) => {
    setRemoving(item._id)
    setTimeout(() => {
      dispatch(removeFromWishlist(item._id))
      setRemoving(null)
      toast.success(`${item.name?.slice(0, 30)}... removed from wishlist`)
    }, 300)
  }

  const handleClearAll = () => {
    dispatch(clearWishlist())
    toast.success('Wishlist cleared')
  }

  return (
    <div className="bg-[#faf9f6] pb-20 font-luxury-sans p-4 lg:p-6">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">

        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shadow-3xs">
                <FaHeart className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight font-luxury-serif">
                  My Wishlist
                </h1>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">
                  {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
                </p>
              </div>
            </div>
          </div>

          {wishlistItems.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-600 border border-red-100 hover:border-red-200 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-all active:scale-95"
            >
              <FaTrash size={11} />
              Clear All
            </button>
          )}
        </div>

        {/* ── Empty State ──────────────────────────────────────────────── */}
        {wishlistItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-28 text-center"
          >
            <div className="w-28 h-28 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-6 shadow-inner">
              <IoHeartDislike className="w-12 h-12 text-red-300" />
            </div>
            <h2 className="text-xl font-black text-gray-800 mb-2 font-luxury-serif">
              Your wishlist is empty
            </h2>
            <p className="text-sm text-gray-400 font-medium mb-8 max-w-xs">
              Tap the heart icon on any product to save it here for later.
            </p>
            <Link
              to="/"
              className="bg-luxury-green-dark hover:bg-luxury-green text-white font-bold px-10 py-3.5 rounded-2xl text-sm uppercase tracking-widest transition-all active:scale-95 shadow-premium"
            >
              Explore Products
            </Link>
          </motion.div>
        )}

        {/* ── Product Grid ─────────────────────────────────────────────── */}
        {wishlistItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            <AnimatePresence>
              {wishlistItems.map((item) => {
                const url = `/product/${valideURLConvert(item.name)}-${item._id}`
                const discountedPrice = pricewithDiscount(item.price, item.discount)
                const originalPrice   = item.mrp || item.price
                const hasDiscount     = Boolean(item.discount) && discountedPrice < originalPrice

                return (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: removing === item._id ? 0 : 1, scale: removing === item._id ? 0.9 : 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25 }}
                    className="group glass-card rounded-3xl overflow-hidden flex flex-col"
                  >
                    {/* Image */}
                    <Link to={url} className="relative aspect-square w-full bg-[#faf9f6] flex items-center justify-center p-4 overflow-hidden">
                      <img
                        src={getImageUrl(item.image?.[0])}
                        alt={item.name}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.05]"
                      />

                      {/* Discount Badge */}
                      {hasDiscount && (
                        <div className="absolute top-3 left-3 w-10 h-10 rounded-full bg-luxury-gold-gradient text-white flex flex-col items-center justify-center leading-none shadow-premium z-10 select-none pointer-events-none border border-white/20">
                          <span className="text-[10px] font-black">{item.discount}%</span>
                          <span className="text-[6.5px] font-black uppercase">OFF</span>
                        </div>
                      )}

                      {/* Remove from Wishlist */}
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemove(item) }}
                        className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white border border-red-100 flex items-center justify-center shadow-sm hover:scale-110 hover:border-red-300 active:scale-90 transition-all cursor-pointer"
                      >
                        <FaHeart className="w-4 h-4 text-red-500" />
                      </button>
                    </Link>

                    {/* Content */}
                    <div className="flex flex-col flex-1 p-4">
                      <Link to={url}>
                        <h3 className="text-[12.5px] lg:text-[13.5px] font-bold text-slate-800 line-clamp-2 leading-snug mb-2 tracking-tight group-hover:text-luxury-green-dark transition-colors">
                          {item.name}
                        </h3>
                      </Link>

                      {item.unit && (
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">
                          {item.unit}
                        </p>
                      )}

                      {/* Price */}
                      <div className="mb-3">
                        <p className="text-[17px] lg:text-[19px] font-black text-luxury-green-dark leading-none">
                          {DisplayPriceInRupees(discountedPrice)}
                        </p>
                        {hasDiscount && (
                          <p className="text-[11px] text-gray-400 font-semibold line-through mt-1">
                            {DisplayPriceInRupees(originalPrice)}
                          </p>
                        )}
                      </div>

                      {/* Stock */}
                      {Number(item.stock) > 0 ? (
                        <div className="flex items-center gap-1.5 bg-emerald-50 text-luxury-green px-3 py-1 rounded-full text-[9px] font-black tracking-wider border border-emerald-100/60 w-fit mb-4">
                          <span className="w-1.5 h-1.5 rounded-full bg-luxury-green" />
                          <span>IN STOCK</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1 rounded-full text-[9px] font-black tracking-wider border border-red-100/60 w-fit mb-4">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          <span>OUT OF STOCK</span>
                        </div>
                      )}

                      {/* CTA */}
                      <div
                        className="mt-auto"
                        onClick={e => { e.preventDefault(); e.stopPropagation() }}
                      >
                        {Number(item.stock) > 0 ? (
                          <AddToCartButton data={item} variant="orange-full" />
                        ) : (
                          <button
                            disabled
                            className="w-full h-10 bg-gray-100 text-gray-400 font-semibold rounded-2xl text-xs flex items-center justify-center cursor-not-allowed select-none"
                          >
                            Out of Stock
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {/* ── Continue Shopping ───────────────────────────────────────── */}
        {wishlistItems.length > 0 && (
          <div className="mt-14 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-luxury-green-dark hover:text-luxury-green border border-luxury-green-dark/20 hover:border-luxury-green/40 bg-white px-8 py-3 rounded-2xl transition-all active:scale-95 shadow-3xs"
            >
              ← Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Wishlist

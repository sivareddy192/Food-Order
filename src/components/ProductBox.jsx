import React, { useState } from 'react'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import { Link, useNavigate } from 'react-router-dom'
import { valideURLConvert } from '../utils/valideURLConvert'
import { pricewithDiscount } from '../utils/PriceWithDiscount'
import { getImageUrl } from '../utils/getImageUrl'
import AddToCartButton from './AddToCartButton'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { useGlobalContext } from '../provider/GlobalProvider'
import { useDispatch, useSelector } from 'react-redux'
import { toggleWishlist } from '../store/wishlistSlice'
import toast from 'react-hot-toast'

const ProductBox = ({ data, hideNewTag, styleWidth = "w-full" }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { addItemToCart, cartItem } = useGlobalContext()
  const wishlistItems = useSelector(state => state.wishlist.items)
  const isFavorite = wishlistItems.some(i => i._id === data._id)

  const url = `/product/${valideURLConvert(data.name)}-${data._id}`

  // ─── Build deduplicated variant list ──────────────────────────────────────
  // Combine base + variants, deduplicate by unit (Map keeps first occurrence)
  const buildAllVariants = (p) => {
    const raw = [
      { unit: p.unit, price: p.price, mrp: p.mrp, discount: p.discount, stock: p.stock },
      ...(p.variants || []).map(v => ({
        unit: v.unit,
        price: v.price,
        mrp: v.mrp,
        discount: v.discount,
        stock: v.stock
      }))
    ].filter(v => v.unit);

    // Deduplicate by normalized unit string
    const seen = new Map();
    raw.forEach(v => {
      const key = (v.unit || '').toString().replace(/\s+/g, '').toLowerCase();
      if (!seen.has(key)) seen.set(key, v);
    });
    return Array.from(seen.values());
  };

  const allVariants = buildAllVariants(data);
  // Only show in-stock in the dropdown, but fall back to all if all are out of stock
  const inStockVariants = allVariants.filter(v => Number(v.stock) > 0);
  const dropdownVariants = inStockVariants.length > 0 ? inStockVariants : allVariants;

  const getBestVariant = (p) => {
    const best = inStockVariants.length > 0 ? inStockVariants[0] : allVariants[0];
    return best || { unit: p.unit, price: p.price, mrp: p.mrp, discount: p.discount, stock: p.stock };
  };

  const images = data.image && Array.isArray(data.image)
    ? data.image.filter(img => typeof img === 'string' && img.trim() !== '')
    : [];

  const [selectedVariant, setSelectedVariant] = useState(() => getBestVariant(data));
  const [stock, setStock] = useState(selectedVariant.stock);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Sync when data changes
  React.useEffect(() => {
    const best = getBestVariant(data);
    setSelectedVariant(best);
    setStock(best.stock);
  }, [data]);

  React.useEffect(() => {
    if (images.length <= 1 || isHovered) {
      return;
    }
    const interval = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % images.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [images.length, isHovered]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setCurrentImgIndex(0);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleVariantChange = (e) => {
    const unit = e.target.value;
    const found = allVariants.find(v => v.unit === unit);
    if (found) {
      setSelectedVariant(found);
      setStock(found.stock);
    }
  };

  // Combined data for AddToCartButton — always keep original product _id
  const activeProductData = {
    ...data,
    unit: selectedVariant.unit,
    price: selectedVariant.price,
    mrp: selectedVariant.mrp,
    discount: selectedVariant.discount,
    stock: selectedVariant.stock
  };

  const isOutOfStock = !(Number(stock) > 0);

  const discountedPrice = pricewithDiscount(selectedVariant.price, selectedVariant.discount);
  const originalPrice   = selectedVariant.mrp || selectedVariant.price;
  const hasDiscount     = Boolean(selectedVariant.discount) && discountedPrice < originalPrice;

  // Determine if product is newly created (within last 3 days)
  const isNewlyCreated = data.createdAt 
    ? ((new Date().getTime() - new Date(data.createdAt).getTime()) / (1000 * 3600 * 24) < 3)
    : false;

  const showNewBadge = isNewlyCreated && !hideNewTag;

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist(data));
    if (isFavorite) {
      toast.success(`Removed from wishlist`);
    } else {
      toast.success(`Added to wishlist`);
    }
  };

  const handleBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const productId = data._id || data.id;
    if (!productId) return;
    const normalize = (str) => (str || '').toString().replace(/\s+/g, '').toLowerCase();
    const currentUnit = normalize(activeProductData.unit);
    const isInCart = cartItem?.some(item => {
      const itemProductId = item.productId?._id || item.productId?.id || item.productId;
      return itemProductId?.toString() === productId?.toString() && normalize(item.unit) === currentUnit;
    });
    if (!isInCart) {
      try { await addItemToCart(activeProductData); } catch (err) {}
    }
    navigate('/checkout');
  };

  return (
    <div className={`group relative shrink-0 ${styleWidth}`}>
      <div 
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="flex flex-col glass-card rounded-3xl overflow-hidden h-full relative"
      >

        {isOutOfStock && (
          <div className="absolute inset-0 bg-[#fafaf8]/70 dark:bg-[#06070a]/70 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-4 select-none">
            <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-2.5 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-premium bg-white dark:bg-neutral-900">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
              <span>Out of Stock</span>
            </div>
          </div>
        )}

        {/* ── Image Zone ───────────────────────────────────────────────── */}
        <Link to={url} className="relative aspect-square w-full bg-[#faf9f6] flex items-center justify-center p-3 overflow-hidden">
          {images.map((imgUrl, idx) => (
            <img
              key={idx}
              src={getImageUrl(imgUrl, 300)}
              alt={`${data.name} view ${idx}`}
              className={`absolute inset-0 w-full h-full object-contain p-3 transition-all duration-700 ease-in-out ${
                idx === currentImgIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
              } ${isHovered && idx === 0 ? 'scale-[1.04]' : 'scale-100'}`}
            />
          ))}
          {images.length === 0 && (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No Image
            </div>
          )}

          {/* Discount Badge – gold circle top-left */}
          {hasDiscount && (
            <div className="absolute top-3 left-3 w-11 h-11 rounded-full bg-luxury-gold-gradient text-white flex flex-col items-center justify-center leading-none shadow-premium z-10 select-none pointer-events-none border border-white/20">
              <span className="text-[11px] font-black">{selectedVariant.discount}%</span>
              <span className="text-[7px] font-black uppercase tracking-wider">OFF</span>
            </div>
          )}

          {/* New Launch Badge */}
          {showNewBadge && !hasDiscount && (
             <div className="absolute top-3 left-3 bg-luxury-green-dark text-white px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest shadow-md z-10 select-none pointer-events-none">
                NEW
             </div>
          )}
          {showNewBadge && hasDiscount && (
             <div className="absolute top-15 left-3 bg-luxury-green-dark text-white px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest shadow-md z-10 select-none pointer-events-none">
                NEW
             </div>
          )}

          {/* Favourite button – circle top-right */}
          <button
            onClick={toggleFavorite}
            className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:scale-110 active:scale-90 transition-all cursor-pointer"
          >
            {isFavorite
              ? <FaHeart className="w-4 h-4 text-red-500" />
              : <FaRegHeart className="w-4 h-4 text-gray-400" />
            }
          </button>

          {/* Low-stock pulse */}
          {stock > 0 && stock <= 10 && (
            <div className="absolute bottom-2 left-2 bg-red-50 border border-red-100 rounded-lg px-2 py-0.5 animate-pulse">
              <span className="text-[9px] font-black text-red-600 uppercase tracking-wider">{stock} Left</span>
            </div>
          )}
        </Link>

        {/* ── Content ──────────────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 p-3 lg:p-4">

          {/* Product Name */}
          <Link to={url}>
            <h3 className="text-[12px] lg:text-[14.5px] font-bold text-slate-800 line-clamp-2 leading-snug mb-2 lg:mb-3 tracking-tight font-luxury-sans group-hover:text-luxury-green-dark transition-colors">
              {data.name}
            </h3>
          </Link>

          {/* Variant Selector / single unit label */}
          <div
            className="mb-2 lg:mb-3"
            onClick={e => { e.preventDefault(); e.stopPropagation(); }}
          >
            {dropdownVariants.length > 1 ? (
              <div className="relative">
                <select
                  value={selectedVariant.unit}
                  onChange={handleVariantChange}
                  className="w-full text-[11px] lg:text-[13px] bg-white border border-gray-200 rounded-xl lg:rounded-2xl py-1.5 lg:py-2.5 pl-3 lg:pl-4 pr-7 lg:pr-9 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-luxury-gold/30 font-semibold text-slate-700 transition-all hover:border-gray-300 font-luxury-sans shadow-3xs"
                >
                  {dropdownVariants.map((v, i) => (
                    <option key={i} value={v.unit}>{v.unit}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            ) : selectedVariant.unit ? (
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest font-luxury-sans">
                {selectedVariant.unit}
              </p>
            ) : null}
          </div>

          {/* Price & Stock Container */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-1.5 lg:gap-2 mb-3 lg:mb-4">
            {/* Price */}
            <div>
              <p className="text-[15px] lg:text-[20px] font-black text-luxury-green-dark leading-none font-luxury-sans">
                {DisplayPriceInRupees(discountedPrice)}
              </p>
              {hasDiscount && (
                <p className="text-[9.5px] lg:text-[11px] text-gray-400 font-semibold line-through mt-0.5 lg:mt-1 font-luxury-sans">
                  {DisplayPriceInRupees(originalPrice)}
                </p>
              )}
            </div>

            {/* Stock Badge */}
            <div className="shrink-0">
              {!isOutOfStock ? (
                <div className="flex items-center gap-1 bg-emerald-50 text-luxury-green px-2 py-0.5 lg:px-2.5 lg:py-1 rounded-full text-[8.5px] lg:text-[9px] font-black tracking-wider border border-emerald-100/60 font-luxury-sans">
                  <span className="w-1 h-1 rounded-full bg-luxury-green" />
                  <span>IN STOCK</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-0.5 lg:px-2.5 lg:py-1 rounded-full text-[8.5px] lg:text-[9px] font-black tracking-wider border border-red-100/60 font-luxury-sans">
                  <span className="w-1 h-1 rounded-full bg-red-500" />
                  <span>OUT OF STOCK</span>
                </div>
              )}
            </div>
          </div>

          {/* CTAs */}
          <div
            className="flex flex-col gap-1.5 mt-auto"
            onClick={e => { e.preventDefault(); e.stopPropagation(); }}
          >
            {!isOutOfStock ? (
              isNewlyCreated ? (
                <button
                  onClick={handleBuyNow}
                  className="w-full h-9 lg:h-11 bg-linear-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white font-bold rounded-xl lg:rounded-2xl text-[9.5px] lg:text-[11px] uppercase tracking-wider lg:tracking-widest transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center shadow-premium font-luxury-sans cursor-pointer"
                >
                  Pre-order
                </button>
              ) : (
                <>
                  {/* ADD TO CART */}
                  <AddToCartButton data={activeProductData} variant="orange-full" />

                  {/* BUY NOW */}
                  <button
                    onClick={handleBuyNow}
                    className="w-full h-9 lg:h-11 bg-luxury-green-dark hover:bg-luxury-green text-white font-bold rounded-xl lg:rounded-2xl text-[9.5px] lg:text-[11px] uppercase tracking-wider lg:tracking-widest transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center shadow-premium font-luxury-sans cursor-pointer"
                  >
                    Buy Now
                  </button>
                </>
              )
            ) : (
              <button
                disabled
                className="w-full h-9 lg:h-11 bg-gray-100 text-gray-400 font-semibold rounded-xl lg:rounded-2xl text-[10px] lg:text-xs flex items-center justify-center cursor-not-allowed select-none font-luxury-sans"
              >
                Out of Stock
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductBox

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { valideURLConvert } from "../utils/valideURLConvert"
import { useNavigate } from "react-router-dom"
import { getImageUrl } from "../utils/getImageUrl"
import CategoryWiseProductDisplay from "../components/CategoryWiseProductDisplay"
import Skeleton from "../components/Skeleton"

import { FaChevronLeft, FaChevronRight } from "react-icons/fa"
import { IoCopyOutline, IoSparklesSharp } from "react-icons/io5"
import toast from "react-hot-toast"
import Axios from "../utils/Axios"
import SummaryApi from "../common/SummaryApi"

import BannerDisplay from "../components/BannerDisplay"
import WelcomeOffersPopup from "../components/WelcomeOffersPopup"

const Home = () => {
  const loadingCategory = useSelector(state => state.product.loadingCategory)
  const categoryData = useSelector(state => state.product.allCategory)
  const subCategoryData = useSelector(state => state.product.allSubCategory)
  const user = useSelector(state => state.user)

  const [welcomeCoupon, setWelcomeCoupon] = useState(null)
  const [festivalOffers, setFestivalOffers] = useState([])
  const [offeredProducts, setOfferedProducts] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [loadingOffers, setLoadingOffers] = useState(false)

  const navigate = useNavigate()

  // Qualify user for Top Banner Promo Strip: Show all times before login and after login as long as a welcome coupon exists
  const shouldShowTopBanner = !!welcomeCoupon;

  // Qualify user for Inline Welcome Card: Show ONLY if logged in (after login) and 0 orders placed AND welcome code not used
  const shouldShowInlineWelcome = welcomeCoupon && user?._id && (
    (!user.orderHistory || user.orderHistory.length === 0) &&
    (!user.usedCoupons || !user.usedCoupons.includes(welcomeCoupon.code))
  );


  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoadingOffers(true)
        const [couponRes, dealsRes, festivalRes, newArrivalsRes] = await Promise.all([
          Axios(SummaryApi.coupon_list),
          Axios(SummaryApi.product_offers),
          Axios(SummaryApi.festivalOffer.get),
          Axios({ ...SummaryApi.getProduct, data: { page: 1, limit: 10 } })
        ])

        if (couponRes.data?.success) {
          const welcome = couponRes.data.coupons?.find(c => c.isFirstOrderOnly && c.isActive)
          setWelcomeCoupon(welcome || null)
        }

        if (dealsRes.data?.success) {
          setOfferedProducts(dealsRes.data.data || [])
        }

        if (festivalRes.data?.success) {
          const activeFestivals = festivalRes.data.data?.filter(o => o.isActive) || []
          setFestivalOffers(activeFestivals)
        }

        if (newArrivalsRes.data?.success) {
          const freshArrivals = (newArrivalsRes.data.data || []).filter(product => {
            if (!product.createdAt) return false;
            const diffDays = (new Date().getTime() - new Date(product.createdAt).getTime()) / (1000 * 3600 * 24);
            return diffDays < 3;
          });
          setNewArrivals(freshArrivals);
        }
      } catch (error) {
        console.error("Error loading home campaigns:", error)
      } finally {
        setLoadingOffers(false)
      }
    }

    fetchCampaigns()
  }, [])

  const handleRedirectProductList = (id, cat) => {
    if (!subCategoryData?.length) return

    const subcategory = subCategoryData.find(sub =>
      sub.category?.some(c => c._id === id)
    )

    if (!subcategory) return

    const url = `/${valideURLConvert(cat)}-${id}/${valideURLConvert(
      subcategory.name
    )}-${subcategory._id}`

    navigate(url)
  }

  return (
    <section className="bg-white dark:bg-neutral-950 min-h-screen transition-colors duration-300">
      <WelcomeOffersPopup />

      {/* 1. Dynamic Top Neon Promo Strip (Tied to Active Coupon) */}
      {shouldShowTopBanner && (
        <div 
          onClick={() => {
            navigator.clipboard.writeText(welcomeCoupon.code)
            toast.success(`Welcome Coupon "${welcomeCoupon.code}" copied to clipboard!`)
          }}
           className="bg-linear-to-r from-orange-600 via-red-500 to-pink-600 text-white py-2.5 px-4 text-center text-[11px] md:text-xs font-black tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer transition-all hover:opacity-95 select-none relative"
        >
          <IoSparklesSharp className="animate-bounce text-yellow-300" />
          <span>🔥 SPECIAL OFFER: GET {welcomeCoupon.discountPercent}% OFF YOUR FIRST ORDER! USE CODE: <strong className="underline font-extrabold ml-1">{welcomeCoupon.code}</strong> 🎁 (TAP TO COPY)</span>
        </div>
      )}
      

      


      {/* Banner Section */}
      <div className="relative cursor-pointer group">
        <BannerDisplay/>
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-white/10 pointer-events-none" />
      </div>

      {/* Categories Section - Below Banner */}
      <div className="container mx-auto px-4 pt-6 pb-2 lg:pt-8 relative z-10 font-luxury-sans">
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <h2 className="font-luxury-serif text-2xl lg:text-3.5xl text-slate-850 font-bold tracking-tight">
            Shop by Category
          </h2>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4 lg:gap-6 px-1">
          {loadingCategory
            ? new Array(12).fill(null).map((_, index) => (
                <div key={index} className="flex flex-col items-center gap-3">
                    <Skeleton className="w-full aspect-square rounded-full" />
                    <Skeleton className="h-2 w-3/4 rounded-full" />
                </div>
              ))

            : categoryData?.map(cat => (
                <div
                  key={cat._id}
                  className="group flex flex-col items-center gap-3 cursor-pointer transition-all duration-300 active:scale-95"
                  onClick={() => handleRedirectProductList(cat._id, cat.name)}
                >
                  <div className="w-full aspect-square rounded-full overflow-hidden border-2 border-gray-100 dark:border-neutral-800 group-hover:border-luxury-gold group-hover:shadow-lg group-hover:shadow-luxury-gold/20 transition-all duration-300 bg-[#f5f0e8] dark:bg-neutral-900">
                    <img
                      src={getImageUrl(cat.image)}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <p className="text-[10px] lg:text-[12.5px] font-semibold text-slate-700 dark:text-gray-200 text-center leading-tight px-1 line-clamp-2 tracking-tight">
                    {cat.name}
                  </p>
                </div>
              ))}
        </div>
      </div>

      {/* 3. Premium Inline Welcome Offer Card */}
      {shouldShowInlineWelcome && (
        <div className="container mx-auto px-4 mt-6 lg:mt-8 relative z-10">
          <div className="glass-gold border-2 border-dashed border-orange-400 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-orange-500/5 relative overflow-hidden group transition-all hover:scale-[1.005]">
            
            {/* Interactive CSS glowing accents */}
            <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-yellow-400 opacity-60 animate-ping" />
            <div className="absolute bottom-4 right-4 w-3 h-3 rounded-sm bg-cyan-400 opacity-50 rotate-45 animate-pulse" />

            <div className="space-y-2 text-center md:text-left relative z-10">
              <div className="inline-flex items-center gap-1.5 bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-orange-200 dark:border-orange-900 animate-pulse mb-1">
                <span>Welcome Gift</span>
                <span>🎁</span>
              </div>
              <h2 className="font-black text-2xl lg:text-4xl text-gray-900 dark:text-gray-100 tracking-tighter leading-none">
                Welcome to Pickle! Get {welcomeCoupon.discountPercent}% OFF Your Order
              </h2>
              <p className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400">
                {welcomeCoupon.minAmount > 0 ? `Applies on orders over ₹${welcomeCoupon.minAmount}` : 'Applies to any order total'}
                {welcomeCoupon.maxDiscount > 0 ? ` • Max savings ₹${welcomeCoupon.maxDiscount}` : ''} • One-time Only!
              </p>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(welcomeCoupon.code)
                toast.success(`Coupon "${welcomeCoupon.code}" copied successfully!`)
              }}
              className="flex items-center gap-3 bg-linear-to-r from-orange-500 to-pink-500 hover:opacity-90 text-white font-black uppercase tracking-widest text-sm md:text-base px-8 py-4 rounded-2xl shadow-xl shadow-orange-500/20 transition-all active:scale-95 shrink-0 select-none cursor-pointer w-full md:w-auto justify-center relative z-10 group"
            >
              <span>{welcomeCoupon.code}</span>
              <IoCopyOutline size={18} className="group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* Festive Special Deals - shown first */}
      {festivalOffers.length > 0 && (
        <div className="container mx-auto px-4 mt-8 lg:mt-12 relative z-10">
          <div className="flex items-center gap-2 mb-4 lg:mb-6 text-orange-500 animate-pulse">
             <span className="text-xl lg:text-2xl">🎉</span>
             <h2 className="font-luxury-serif text-xl lg:text-3xl text-gray-900 dark:text-gray-100 tracking-tight font-black uppercase">
               Festive Special Deals
             </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {festivalOffers.map(offer => (
                <div 
                  key={offer._id}
                  onClick={() => {
                      if (!offer.link) return;
                      if (offer.link.startsWith("http://") || offer.link.startsWith("https://")) {
                          window.location.href = offer.link;
                      } else {
                          navigate(offer.link);
                      }
                  }}
                  className={`relative aspect-21/9 md:aspect-video overflow-hidden rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 group glass-panel ${
                      offer.link 
                        ? "cursor-pointer hover:scale-[1.01] hover:-translate-y-1" 
                        : "cursor-default"
                  }`}
                >
                   {offer.image && (
                      <img 
                        src={getImageUrl(offer.image)} 
                        alt={offer.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                   )}
                   {/* Premium gradient overlay */}
                   <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                       <div className="transform translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                           {offer.discountPercent > 0 && (
                              <span className="bg-linear-to-r from-red-600 to-orange-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md inline-block mb-1.5 shadow-md">
                                 {offer.discountPercent}% Off Deal
                              </span>
                           )}
                           <h3 className="font-black text-lg lg:text-xl leading-tight tracking-tight uppercase text-orange-400 group-hover:text-yellow-400 transition-colors select-none drop-shadow-md truncate" title={offer.title}>
                             {offer.title}
                           </h3>
                           {offer.subTitle && (
                              <p className="text-xs text-slate-200 font-medium mt-0.5 select-none drop-shadow-sm line-clamp-1 opacity-90">
                                {offer.subTitle}
                              </p>
                           )}
                           
                           {offer.couponCode && (
                             <div className="mt-2.5 flex items-center gap-2 border-t border-white/10 pt-2">
                                <span className="text-[9px] text-slate-300 uppercase font-bold tracking-wider">Use Code:</span>
                                <span 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(offer.couponCode);
                                        toast.success(`Coupon code "${offer.couponCode}" copied!`);
                                        setTimeout(() => {
                                            if (!offer.link) return;
                                            if (offer.link.startsWith("http://") || offer.link.startsWith("https://")) {
                                                window.location.href = offer.link;
                                            } else {
                                                navigate(offer.link);
                                            }
                                        }, 800);
                                    }}
                                    className="bg-white text-slate-900 font-black text-[10px] tracking-widest uppercase px-2 py-0.5 rounded border border-dashed border-slate-400 shadow-sm cursor-pointer hover:scale-105 transition-transform"
                                    title="Click to copy and view product"
                                >
                                   {offer.couponCode}
                                </span>
                             </div>
                           )}
                       </div>
                   </div>
                </div>
             ))}
          </div>
        </div>
      )}

      {/* Exclusive Super Saver Deals - shown below Festive Deals */}
      {offeredProducts.length > 0 && (
        <div className="mt-8 lg:mt-12 bg-slate-50/70 dark:bg-neutral-900/20 py-4 border-y border-slate-100 dark:border-neutral-900">
          <CategoryWiseProductDisplay
            manualData={offeredProducts}
            name="🔥 Exclusive Super Saver Deals"
          />
        </div>
      )}

      {/* New Arrivals Section */}
      {newArrivals.length > 0 && (
        <div className="mt-8 lg:mt-12 bg-white dark:bg-neutral-950 py-4">
          <div className="container mx-auto px-4 flex justify-between items-center -mb-4">
             <h2 className="font-luxury-serif text-2xl lg:text-3xl font-black text-luxury-green-dark uppercase tracking-widest pl-2">
               New Arrivals
             </h2>
             <button onClick={() => navigate('/new-arrivals')} className="text-luxury-gold hover:text-luxury-green-dark font-bold text-sm uppercase tracking-widest transition-colors mr-2">
               View All
             </button>
          </div>
          <CategoryWiseProductDisplay
            manualData={newArrivals}
            name=""
            hideNewTag={true}
          />
        </div>
      )}



      {/* Product Sections */}
      <div className="space-y-4 lg:space-y-12 mt-10 pb-20">
        {categoryData?.map(c => (
          <div key={c?._id + "wrapper"}>
            <CategoryWiseProductDisplay
              id={c?._id}
              name={c?.name}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

export default Home

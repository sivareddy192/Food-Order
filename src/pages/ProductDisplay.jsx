import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import SummaryApi from '../common/SummaryApi'
import Axios from '../utils/Axios'
import AxiosToastError from '../utils/AxiosToastError'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import Divider from '../components/Divider'
import Loading from '../components/Loading'
import { pricewithDiscount } from '../utils/PriceWithDiscount'
import AddToCartButton from '../components/AddToCartButton'
import CategoryWiseProductDisplay from '../components/CategoryWiseProductDisplay'
import ReviewsSection from '../components/ReviewsSection'
import ProductAIChat from '../components/ProductAIChat'
import { getImageUrl } from '../utils/getImageUrl'
import { motion, AnimatePresence } from 'framer-motion'
import toast from "react-hot-toast"
import { useGlobalContext } from '../provider/GlobalProvider'

const ProductDisplay = () => {
  const params = useParams()
  const navigate = useNavigate()
  const { addItemToCart, cartItem } = useGlobalContext()
  const productUrl = params?.product
  const productId = productUrl ? productUrl.split("-").pop() : null

  const [data, setData] = useState({
    name: "",
    image: [],
    video: ""
  })

  const [image, setImage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [reviews, setReviews] = useState([])
  const [reviewLoading, setReviewLoading] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [showStickyBar, setShowStickyBar] = useState(false)
  const galleryRef = useRef(null)
  const thumbnailRef = useRef(null)
  const modalGalleryRef = useRef(null)
  const mainAddToCartRef = useRef(null)
  const [isMobile, setIsMobile] = useState(false)
  const [pincode, setPincode] = useState("")
  const [isPincodeChecked, setIsPincodeChecked] = useState(false)
  const [pincodeAvailable, setPincodeAvailable] = useState(null)
  const [showOpenBoxModal, setShowOpenBoxModal] = useState(false)
  const [showAllImages, setShowAllImages] = useState(false)

  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const [isZoomed, setIsZoomed] = useState(false)

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }

  // Custom active tab state inside details accordion
  const [activeTab, setActiveTab] = useState("SHOWCASE")

  // Custom accordions state
  const [openAccordion, setOpenAccordion] = useState({
    shop: true,
    highlights: false,
    details: false
  })

  const toggleAccordion = (section) => {
    setOpenAccordion(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Filter valid images to prevent extra dots or empty elements
  const validImages = data?.image?.filter(img => typeof img === 'string' && img.trim() !== '') || []
  const hasVideo = !!(data?.video && typeof data.video === 'string' && data.video.trim() !== '' && data.video !== 'null' && data.video !== 'undefined')
  const mediaList = [...(hasVideo ? [data.video] : []), ...validImages]

  const getDeliveryDates = (pin) => {
    const firstDigit = pin ? pin.charAt(0) : '';
    let baseStart = 3;
    let baseEnd = 15;
    
    if (firstDigit === '1') {
      baseStart = 3;
      baseEnd = 5;
    } else if (firstDigit === '2') {
      baseStart = 4;
      baseEnd = 6;
    } else if (firstDigit === '3') {
      baseStart = 5;
      baseEnd = 7;
    } else if (firstDigit === '4') {
      baseStart = 4;
      baseEnd = 6;
    } else if (firstDigit === '5') {
      baseStart = 3;
      baseEnd = 5;
    } else if (firstDigit === '6') {
      baseStart = 2;
      baseEnd = 4;
    } else {
      baseStart = 3;
      baseEnd = 15;
    }

    let productOffset = 0;
    if (data?._id) {
      const charSum = data._id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      productOffset = charSum % 3;
    }

    const currentCartItem = cart.find(item => item.productId?._id === data?._id || item.productId === data?._id);
    const currentItemQty = currentCartItem ? currentCartItem.quantity : 0;
    const hasSameItemSpeedup = currentItemQty >= 2;
    const cartQtyOffset = (totalCartQty <= 1 && !hasSameItemSpeedup) ? 3 : 0;

    const startOffset = baseStart + productOffset + cartQtyOffset;
    const startDate = new Date(Date.now() + startOffset * 24 * 60 * 60 * 1000);

    const startStr = startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' }).toUpperCase();

    return {
      range: startStr
    };
  };



  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleNext = (e) => {
    e.stopPropagation()
    const totalMedia = mediaList.length
    if (totalMedia > 0) {
      setImage((prev) => (prev + 1) % totalMedia)
    }
  }

  const handlePrev = (e) => {
    e.stopPropagation()
    const totalMedia = mediaList.length
    if (totalMedia > 0) {
      setImage((prev) => (prev - 1 + totalMedia) % totalMedia)
    }
  }

  const handleScrollThumbnails = (direction) => {
    if (thumbnailRef.current) {
        const scrollAmount = 200;
        thumbnailRef.current.scrollBy({ 
            left: direction === 'left' ? -scrollAmount : scrollAmount, 
            behavior: 'smooth' 
        });
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting)
      },
      { threshold: 0 }
    )

    if (mainAddToCartRef.current) {
      observer.observe(mainAddToCartRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleScroll = () => {
    if (!galleryRef.current) return
    const scrollLeft = galleryRef.current.scrollLeft
    const width = galleryRef.current.offsetWidth
    const index = Math.round(scrollLeft / width)
    const totalMedia = mediaList.length
    if (index !== image && index >= 0 && index < totalMedia) {
      setImage(index)
    }
  }

  const user = useSelector(state => state?.user)
  const addressList = useSelector(state => state?.addresses?.addressList) || []
  const cart = useSelector(state => state?.cartItem?.cart) || []
  const totalCartQty = cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
  const hasUserReviewed = reviews.some(r => r.userId === user?._id)

  useEffect(() => {
    if (addressList.length > 0 && !pincode) {
      const defaultPin = addressList[0].pincode;
      if (defaultPin && defaultPin.length === 6) {
        setPincode(defaultPin);
        setIsPincodeChecked(true);
        setPincodeAvailable(true);
      }
    }
  }, [addressList]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.getProductDetails,
        data: { productId }
      })

      if (response.data.success && response.data.data) {
        const productData = response.data.data
        setData({
          ...productData,
          _original: {
            unit: productData.unit,
            price: productData.price,
            mrp: productData.mrp,
            discount: productData.discount,
            stock: productData.stock
          }
        })
      } else {
        setData({})
      }
    } catch (error) {
      AxiosToastError(error)
      setData({})
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    if (!productId) return;
    try {
        setReviewLoading(true)
        const response = await Axios(SummaryApi.review_get(productId))
        if (response.data.success) {
            setReviews(response.data.data)
        }
    } catch (error) {
        console.error("Error fetching reviews", error)
    } finally {
        setReviewLoading(false)
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    setData({
      name: "",
      image: [],
      video: ""
    })
    fetchProductDetails()
    fetchReviews()
  }, [params])

  // Reset selected image and scroll position when details finish loading or product ID changes
  useEffect(() => {
    if (!loading && galleryRef.current) {
      galleryRef.current.scrollLeft = 0
      setImage(0)
    }
  }, [loading, productId])

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Product link copied to clipboard!")
  }

  const handleBuyNow = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!productId) return
    
    // Combined data for cart
    const activeProductData = {
      ...data,
      unit: data.unit,
      price: data.price,
      mrp: data.mrp,
      discount: data.discount,
      stock: data.stock
    }

    const normalize = (str) => (str || "").toString().replace(/\s+/g, "").toLowerCase()
    const currentUnit = normalize(activeProductData.unit)
    const isInCart = cart?.some(item => {
        const itemProductId = item.productId?._id || item.productId?.id || item.productId
        return itemProductId?.toString() === productId?.toString() && normalize(item.unit) === currentUnit
    })

    if (!isInCart) {
        try {
            await addItemToCart(activeProductData)
        } catch (error) {
            console.error("Error adding to cart:", error)
        }
    }
    navigate("/checkout")
  }

  // Determine if product is newly created (within last 3 days)
  const isNewlyCreated = data.createdAt 
    ? ((new Date().getTime() - new Date(data.createdAt).getTime()) / (1000 * 3600 * 24) < 3)
    : false;

  const baseVariant = data._original ? {
    unit: data._original.unit,
    price: data._original.price,
    mrp: data._original.mrp,
    discount: data._original.discount,
    stock: data._original.stock,
    isOriginal: true
  } : null;

  const otherVariants = (data.variants || [])
    .filter(v => v.unit && v.unit !== data?._original?.unit)
    .map(v => ({ ...v, isOriginal: false }));

  const allVariants = baseVariant ? [baseVariant, ...otherVariants] : [];

  if (loading) {
    return (
      <section className='w-full mx-auto pb-32 lg:pb-10 bg-white text-gray-900 min-h-screen'>
        <div className='flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-16 max-w-7xl mx-auto px-4 lg:px-6 mt-4 lg:mt-10 animate-pulse'>
          
          {/* Left Column: Image Gallery Skeleton */}
          <div className='w-full flex flex-col gap-4 mt-4 lg:mt-10'>
            <div className='aspect-square w-full bg-gray-100 rounded-3xl' />
            <div className='flex gap-3 overflow-x-auto pb-2'>
              {[1, 2, 3, 4].map(n => (
                <div key={n} className='w-16 h-16 lg:w-24 lg:h-24 bg-gray-50 rounded-2xl shrink-0' />
              ))}
            </div>
          </div>

          {/* Right Column: Info Skeleton */}
          <div className='flex flex-col gap-4 mt-4 lg:mt-10 font-luxury-sans'>
            {/* Delivery badge */}
            <div className='h-7 w-48 bg-gray-50 rounded-full' />
            {/* Title */}
            <div className='h-9 w-3/4 bg-gray-100 rounded-xl mt-2' />
            <div className='h-9 w-1/2 bg-gray-100 rounded-xl' />
            {/* Share button */}
            <div className='h-8 w-24 bg-gray-50 rounded-full mt-2' />
            {/* Ratings */}
            <div className='h-6 w-56 bg-gray-50 rounded-lg mt-2' />
            {/* Price */}
            <div className='flex items-center gap-3 mt-4'>
              <div className='h-12 w-36 bg-gray-100 rounded-xl' />
              <div className='h-7 w-20 bg-gray-50 rounded-lg' />
              <div className='h-7 w-24 bg-gray-50 rounded-full' />
            </div>
            {/* Stock badge */}
            <div className='h-7 w-32 bg-gray-50 rounded-full mt-2' />
            {/* Action buttons */}
            <div className='flex gap-4 mt-4 w-full max-w-lg'>
              <div className='h-11 flex-1 bg-gray-100 rounded-xl' />
              <div className='h-11 flex-1 bg-gray-100 rounded-xl' />
            </div>
            {/* Trust Card */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6'>
              <div className='h-20 bg-gray-50 rounded-2xl border border-gray-100' />
              <div className='h-20 bg-gray-50 rounded-2xl border border-gray-100' />
            </div>
            {/* Accordions */}
            <div className='space-y-4 mt-6'>
              {[1, 2, 3].map(n => (
                <div key={n} className='h-14 w-full bg-gray-50 rounded-2xl border border-gray-100' />
              ))}
            </div>
          </div>

        </div>
      </section>
    )
  }

  if (!data || !data.name) {
    return (
      <section className='w-full mx-auto py-20 bg-white text-gray-900 min-h-[60vh] flex flex-col items-center justify-center font-luxury-sans'>
        <div className='w-16 h-16 text-amber-600 mb-4'>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-16 h-16">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className='text-2xl font-bold text-luxury-green-dark mb-2'>Product Not Found</h2>
        <p className='text-gray-500 mb-6 text-sm text-center px-4'>The product you are looking for does not exist, is unpublished, or failed to load.</p>
        <button 
          onClick={() => navigate('/')} 
          className='bg-luxury-green-dark hover:bg-luxury-green text-white font-bold px-8 py-3 rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md'
        >
          Go Back Home
        </button>
      </section>
    )
  }

  return (
    <>
      <section className='w-full mx-auto pb-32 lg:pb-10 bg-white text-gray-900 transition-colors duration-300 min-h-screen'>
        <div className='flex flex-col lg:grid lg:grid-cols-2 gap-0 lg:gap-16 max-w-7xl mx-auto px-4 lg:px-6'>
            
            {/* Left Column: Image Gallery */}
            <div className='w-full max-w-full overflow-hidden bg-white mt-4 lg:mt-10'>
                <div className='relative bg-white aspect-square flex items-center justify-center overflow-hidden border border-gray-100 rounded-3xl shadow-sm'>
                    


                    <div 
                        ref={galleryRef}
                        onScroll={handleScroll}
                        className='w-full h-full flex overflow-x-scroll snap-x snap-mandatory no-scrollbar lg:overflow-hidden'
                    >
                        {mediaList.map((item, index) => (
                            <div key={index} className='w-full min-w-full h-full shrink-0 snap-center snap-always flex items-center justify-center p-0'>
                                {hasVideo && index === 0 ? (
                                    <div className='w-full h-full p-4 lg:p-6'>
                                        <div 
                                            onClick={() => setIsFullScreen(true)}
                                            className='relative w-full h-full bg-black rounded-xl overflow-hidden flex items-center justify-center cursor-pointer'
                                        >
                                            <video 
                                                src={getImageUrl(item)} 
                                                className='w-full h-full object-contain pointer-events-none'
                                                muted
                                                playsInline
                                            />
                                            <div className='absolute inset-0 flex items-center justify-center bg-black/25'>
                                                <div className='w-14 h-14 bg-white/95 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95'>
                                                    <svg className="w-8 h-8 text-green-700 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div 
                                        className={`relative w-full h-full overflow-hidden flex items-center justify-center ${!isMobile ? 'cursor-zoom-in' : ''}`}
                                        onMouseMove={!isMobile ? handleMouseMove : undefined}
                                        onMouseEnter={!isMobile ? () => setIsZoomed(true) : undefined}
                                        onMouseLeave={!isMobile ? () => {
                                            setIsZoomed(false);
                                            setZoomPos({ x: 50, y: 50 });
                                        } : undefined}
                                        onClick={() => setIsFullScreen(true)}
                                    >
                                        <img
                                            src={getImageUrl(item, 800)}
                                            style={(!isMobile && isZoomed) ? {
                                                transform: 'scale(2.2)',
                                                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                                            } : {
                                                transform: 'scale(1)',
                                                transformOrigin: 'center'
                                            }}
                                            className={`w-full h-full object-contain transition-all duration-150 ease-out pointer-events-none ${(!isMobile && isZoomed) ? 'p-0' : 'p-4 lg:p-6'}`}
                                            alt={`${data?.name}-${index}`}
                                        /> 
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Mobile Pagination Dot */}
                    {mediaList.length > 1 && (
                        <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 lg:hidden'>
                            {mediaList.map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`h-1 transition-all duration-300 rounded-full ${i === image ? 'w-4 bg-green-600' : 'w-1 bg-gray-200'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Thumbnails (Hidden on mobile) */}
                <div className='hidden lg:block relative mt-6 px-1'>
                    {mediaList.length > 4 && (
                        <>
                            <button 
                                onClick={() => handleScrollThumbnails('left')}
                                className='absolute -left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 border border-gray-100 shadow-lg rounded-full z-10 flex items-center justify-center text-gray-600 hover:bg-white active:scale-90 transition-all'
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button 
                                onClick={() => handleScrollThumbnails('right')}
                                className='absolute -right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 border border-gray-100 shadow-lg rounded-full z-10 flex items-center justify-center text-gray-600 hover:bg-white active:scale-90 transition-all'
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </>
                    )}
                    <div 
                        ref={thumbnailRef}
                        className='flex items-center gap-3 overflow-x-auto no-scrollbar pb-2'
                    >
                      {
                        mediaList.map((item, index) => (
                          <div 
                            key={index}
                            onClick={() => {
                                setImage(index)
                                if (galleryRef.current) {
                                    galleryRef.current.scrollTo({
                                        left: index * galleryRef.current.offsetWidth,
                                        behavior: 'auto'
                                    })
                                }
                            }}
                            className={`w-16 h-16 lg:w-24 lg:h-24 shrink-0 rounded-2xl border-2 cursor-pointer transition-all duration-200 p-1
                              ${index === image ? 'border-green-600 bg-green-50/30' : 'border-gray-100 bg-white hover:border-gray-300'}`}
                          >
                            {hasVideo && index === 0 ? (
                                <div className='relative w-full h-full bg-black rounded-xl overflow-hidden flex items-center justify-center'>
                                    {validImages[0] && (
                                        <img src={getImageUrl(validImages[0], 150)} className='absolute inset-0 w-full h-full object-cover opacity-50' alt="video thumbnail" />
                                    )}
                                    <div className='absolute inset-0 flex items-center justify-center'>
                                        <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                                        </svg>
                                    </div>
                                </div>
                            ) : (
                                <img src={getImageUrl(item, 150)} className='w-full h-full object-contain' alt={`thumbnail-${index}`} />
                            )}
                          </div>
                        ))
                      }
                    </div>
                </div>

                {/* Reviews Section (Desktop Only - Left Side) */}
                <div className='hidden lg:block mt-20 border-t border-gray-150 pt-16 pb-20'>
                    <ReviewsSection 
                        productId={productId}
                        reviews={reviews}
                        setReviews={setReviews}
                        fetchReviews={fetchReviews}
                    />
                </div>
            </div>

            {/* Right Column: Product Info */}
            <div className='flex flex-col pt-4 lg:mt-10 font-luxury-sans'>
                {/* 🚚 DELIVERY SPEED BADGE */}
                <div className="bg-[#fcfbf9] border border-luxury-gold/30 text-luxury-green-dark font-semibold rounded-full px-3.5 py-1.5 text-[10px] tracking-wide w-fit flex items-center gap-1.5 mb-4 shadow-3xs select-none">
                    <span className="text-luxury-gold">🚚</span>
                    <span className="uppercase text-[8.5px] tracking-widest font-bold opacity-80">Estimated Delivery</span>
                    <span className="font-extrabold text-luxury-gold">{getDeliveryDates(pincode).range}</span>
                </div>
                {allVariants.length > 1 && (
                  <div className="mb-6 mt-4 font-luxury-sans">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Variant: <span className="text-slate-800 font-extrabold normal-case">{data.unit}</span>
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {allVariants.map((v, i) => {
                        const isSelected = data.unit === v.unit;
                        const finalPrice = pricewithDiscount(v.mrp || v.price, v.discount || 0);
                        
                        return (
                          <motion.div
                            key={i}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              if (v.isOriginal) {
                                // Restore original — exclude _id so product _id is preserved
                                const { _id: _ignoreId, isOriginal, ...originalFields } = data._original;
                                setData(prev => ({ ...prev, ...originalFields }));
                              } else {
                                // Spread variant fields but NEVER overwrite the product's _id
                                const { _id: _variantId, isOriginal: _iso, ...variantFields } = v;
                                setData(prev => ({ ...prev, ...variantFields }));
                              }
                            }}
                            className={`relative w-36 p-3 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                              isSelected 
                              ? 'border-slate-800 bg-white ring-2 ring-slate-800/5 shadow-premium' 
                              : 'border-gray-200 bg-white hover:border-slate-350 text-gray-500'
                            }`}
                          >
                            <p className={`text-xs font-black tracking-tight uppercase ${isSelected ? 'text-slate-900' : 'text-gray-500'}`}>
                              {v.unit}
                            </p>
                            <div className="border-b border-gray-100 my-2 w-full" />
                            <p className={`text-[13px] font-black ${isSelected ? 'text-luxury-green-dark' : 'text-gray-700'}`}>
                              {DisplayPriceInRupees(finalPrice)}
                            </p>
                            {!(Number(v.stock) > 0) && (
                              <div className="absolute inset-0 bg-white/55 backdrop-blur-[1px] flex items-center justify-center rounded-2xl z-20 overflow-hidden">
                                <span className="text-[8.5px] font-black text-gray-500 bg-white/95 px-1.5 py-0.5 rounded border border-gray-150 shadow-3xs tracking-wider uppercase transform -rotate-12">
                                  Sold Out
                                </span>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className='flex items-center justify-between gap-3 mb-2'>
                    <h1 className='text-2xl lg:text-3.5xl font-bold text-luxury-green-dark leading-tight tracking-tight font-luxury-serif'>{data.name}</h1>
                </div>

                {/* Share Button (Directly below Title) */}
                <button
                    onClick={handleShare}
                    className="mt-2 border border-gray-200 rounded-full px-4.5 py-1.5 flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-white hover:bg-[#faf9f6] hover:border-luxury-gold/40 transition-all cursor-pointer w-fit shadow-3xs active:scale-95 select-none"
                >
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 10.742l4.572-2.286m0 3.088l-4.572-2.286M2 12a3 3 0 116 0 3 3 0 01-6 0zm10-5a3 3 0 116 0 3 3 0 01-6 0zm0 10a3 3 0 116 0 3 3 0 01-6 0z" />
                    </svg>
                    <span>Share</span>
                </button>

                {/* Rating Summary (Styled as screenshot) */}
                <div className="flex items-center gap-2 mt-3.5 mb-3 select-none">
                    <div className="flex items-center bg-luxury-gold-gradient text-white px-2.5 py-0.5 rounded-lg text-[11px] font-bold shadow-3xs border border-white/10">
                        <span>
                            {reviews.length ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(0) : "4"}
                        </span>
                        <svg className="w-2.5 h-2.5 fill-current ml-1 text-white" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </div>
                    <span className="text-xs font-semibold text-gray-500">
                        {reviews.length || 1} {reviews.length === 1 ? "Rating" : "Ratings"} & {reviews.length || 1} {reviews.length === 1 ? "Review" : "Reviews"}
                    </span>
                </div>

                {data.unit && (
                    <span className='text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1.5 mb-2'>{data.unit}</span>
                )}

                {/* Inline Price, MRP, and Discount Badge */}
                <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-4xl font-extrabold text-luxury-green-dark tracking-tight">
                        {DisplayPriceInRupees(pricewithDiscount(data.mrp || data.price, data.discount))}
                    </p>
                    {Boolean(data.discount) && (
                        <>
                            <p className="text-lg text-gray-400 font-semibold line-through ml-2">
                                {DisplayPriceInRupees(data.mrp || data.price)}
                            </p>
                            <span className="bg-[#faf9f6] border border-luxury-gold/30 text-luxury-gold text-[11px] font-black tracking-widest px-3 py-0.5 rounded-full ml-3 uppercase shadow-3xs select-none">
                                {data.discount}% OFF
                            </span>
                        </>
                    )}
                </div>

                {/* Stock Status Badge */}
                <div className="mt-3.5 mb-4">
                    {Number(data.stock) > 0 ? (
                        <div className="flex items-center gap-1.5 bg-emerald-50 text-luxury-green px-3.5 py-1 rounded-full text-[9.5px] font-black tracking-wider w-fit border border-emerald-150/40 shadow-3xs uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-luxury-green"></span>
                            <span>In Stock - Ready to Ship</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 bg-red-50 text-red-650 px-3.5 py-1 rounded-full text-[9.5px] font-black tracking-wider w-fit border border-red-150/40 shadow-3xs uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                            <span>Out of Stock</span>
                        </div>
                    )}
                </div>

                {/* Add to Cart / Buy Now Action Block (Side-by-side) */}
                <div 
                    ref={mainAddToCartRef}
                    className="flex flex-row gap-4 mt-4 w-full max-w-lg select-none"
                >
                    {Number(data.stock) > 0 ? (
                        isNewlyCreated ? (
                            <button
                                onClick={handleBuyNow}
                                className="flex-1 h-10 bg-linear-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center shadow-premium select-none cursor-pointer"
                            >
                                Pre-order
                            </button>
                        ) : (
                            <>
                                <div className="flex-1">
                                    <AddToCartButton data={data} variant="orange-full" />
                                </div>
                                <button
                                    onClick={handleBuyNow}
                                    className="flex-1 h-10 bg-luxury-green-dark hover:bg-luxury-green text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center shadow-premium select-none cursor-pointer"
                                >
                                    Buy Now
                                </button>
                            </>
                        )
                    ) : (
                        <button
                            disabled
                            className="w-full h-10 bg-gray-50 text-gray-400 font-semibold rounded-xl text-xs flex items-center justify-center cursor-not-allowed select-none border border-gray-200"
                        >
                            Out of Stock
                        </button>
                    )}
                </div>

                {/* Premium Double Trust Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    
                    {/* Card 2: SAFE BUY GUARANTEE */}
                    <div className="flex items-center gap-3.5 bg-[#fbfbfa] border border-luxury-gold/20 rounded-2xl p-4 shadow-3xs hover:shadow-premium transition-all select-none">
                        <div className="w-10 h-10 rounded-full bg-[#fcfbf9] border border-luxury-gold/20 flex items-center justify-center text-luxury-gold shrink-0 shadow-3xs">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-luxury-green-dark leading-none font-luxury-sans">SAFE BUY GUARANTEE</h4>
                            <p className="text-[10px] text-gray-500 font-bold mt-1.5 leading-snug">100% Authentic & Secure Checkout</p>
                        </div>
                    </div>
                </div>

                {/* React Custom Accordions */}
                <div className="space-y-4 mt-6">
                    {/* Accordion 1: Shop with peace of mind */}
                    <div className="border border-gray-200/60 rounded-2xl overflow-hidden bg-white shadow-3xs">
                        <button
                            onClick={() => toggleAccordion('shop')}
                            className="w-full px-6 py-4 flex items-center justify-between font-bold text-sm text-luxury-green-dark bg-[#fbfbfa]/70 hover:bg-[#fbfbfa] transition-colors select-none font-luxury-sans"
                        >
                            <span>Premium Quality Assurance</span>
                            <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${openAccordion.shop ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {openAccordion.shop && (
                            <div className="px-6 py-5 border-t border-gray-150 bg-white">
                                {/* Inner Card (Warranty Card) */}
                                <div className="flex items-center gap-4 bg-white border border-gray-200/65 rounded-2xl p-4 shadow-3xs mb-5 select-none">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-150 flex items-center justify-center text-luxury-gold shadow-sm shrink-0">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-luxury-green-dark leading-none font-luxury-sans">Freshness Guaranteed</h4>
                                        <p className="text-[10px] text-gray-500 font-bold mt-1.5 leading-snug">Handcrafted using authentic, traditional recipes</p>
                                    </div>
                                </div>

                                {/* Three circular options */}
                                <div className="flex items-center justify-between gap-2 mt-2 pt-1 px-1">
                                    <div className="flex flex-col items-center flex-1">
                                        <div className="w-10 h-10 rounded-full border border-luxury-gold/20 bg-[#fcfbf9] flex items-center justify-center text-luxury-gold shadow-3xs">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-700 mt-2 text-center leading-tight">24/7 Premium Support</span>
                                    </div>

                                    <div className="flex flex-col items-center flex-1">
                                        <div className="w-10 h-10 rounded-full border border-emerald-100/50 bg-[#e6f4ea]/40 flex items-center justify-center text-emerald-600 shadow-3xs">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-700 mt-2 text-center leading-tight">Cash on Delivery</span>
                                    </div>

                                    <div className="flex flex-col items-center flex-1">
                                        <div className="w-10 h-10 rounded-full border border-cyan-100/50 bg-cyan-50/40 flex items-center justify-center text-cyan-600 shadow-3xs">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-700 mt-2 text-center leading-tight">Online Payment</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Accordion 2: Product highlights */}
                    <div className="border border-gray-200/60 rounded-2xl overflow-hidden bg-white shadow-3xs">
                        <button
                            onClick={() => toggleAccordion('highlights')}
                            className="w-full px-6 py-4 flex items-center justify-between font-bold text-sm text-luxury-green-dark bg-[#fbfbfa]/70 hover:bg-[#fbfbfa] transition-colors select-none font-luxury-sans"
                        >
                            <span>Product highlights</span>
                            <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${openAccordion.highlights ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {openAccordion.highlights && (
                            <div className="px-6 py-5 border-t border-gray-150 bg-white space-y-4 font-luxury-sans">
                                {(() => {
                                    // Get raw highlights list from data.more_details first key or fallback
                                    let highlightsList = [];
                                    if (data?.more_details && Object.keys(data.more_details).length > 0) {
                                        const firstKey = Object.keys(data.more_details)[0];
                                        const value = data.more_details[firstKey];
                                        highlightsList = String(value).split('\n').filter(line => line.trim() !== "");
                                    }

                                    // Fallback highlights if empty
                                    if (highlightsList.length === 0) {
                                        highlightsList = [
                                            "100% Organic & Handpicked Ingredients",
                                            "No Artificial Colors or Preservatives",
                                            "Sun-Dried and Naturally Fermented",
                                            "Rich in Authentic Traditional Spices",
                                            "Perfect Accompaniment to Every Meal"
                                        ];
                                    }

                                    // Define icons list
                                    const icons = [
                                        // Lightning Bolt
                                        <svg className="w-4 h-4 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
                                        // Shield
                                        <svg className="w-4 h-4 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
                                        // Speaker
                                        <svg className="w-4 h-4 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>,
                                        // Bluetooth
                                        <svg className="w-4 h-4 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 10.742l4.572-2.286m0 3.088l-4.572-2.286M2 12a3 3 0 116 0 3 3 0 01-6 0zm10-5a3 3 0 116 0 3 3 0 01-6 0zm0 10a3 3 0 116 0 3 3 0 01-6 0z" /></svg>,
                                        // Checkmark
                                        <svg className="w-4 h-4 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                    ];

                                    return highlightsList.map((highlight, index) => (
                                        <div key={index} className="flex items-center gap-3.5 select-none">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 shadow-3xs">
                                                {icons[index % icons.length]}
                                            </div>
                                            <span className="font-semibold text-xs text-gray-700 leading-normal">
                                                {highlight.replace(/^\d+\.\s*/, '')}
                                            </span>
                                        </div>
                                    ));
                                })()}
                            </div>
                        )}
                    </div>

                    {/* Accordion 3: All details */}
                    <div className="border border-gray-200/60 rounded-2xl overflow-hidden bg-white shadow-3xs">
                        <button
                            onClick={() => toggleAccordion('details')}
                            className="w-full px-6 py-4 flex items-center justify-between font-bold text-sm text-luxury-green-dark bg-[#fbfbfa]/70 hover:bg-[#fbfbfa] transition-colors select-none font-luxury-sans"
                        >
                            <span>All details</span>
                            <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${openAccordion.details ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {openAccordion.details && (
                            <div className="px-6 py-5 border-t border-gray-150 bg-white font-luxury-sans">
                                {(() => {
                                    // Build the list of tabs dynamically
                                    const tabs = [];
                                    
                                    // Showcase tab
                                    if (validImages.length > 0) tabs.push("SHOWCASE");
                                    
                                    // specifications dynamic keys from more_details
                                    if (data?.more_details) {
                                        Object.keys(data.more_details).forEach(key => {
                                            const upperKey = key.toUpperCase();
                                            if (!tabs.includes(upperKey)) {
                                                tabs.push(upperKey);
                                            }
                                        });
                                    }

                                    // Description tab
                                    if (data.description && !tabs.includes("DESCRIPTION")) tabs.push("DESCRIPTION");

                                    // Ensure active tab is in tabs list
                                    if (!tabs.includes(activeTab)) {
                                        setActiveTab(tabs[0] || "DESCRIPTION");
                                    }

                                    return (
                                        <>
                                            {/* Tab pills bar */}
                                            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-3.5 mb-5 border-b border-gray-100">
                                                {tabs.map(tab => (
                                                    <button
                                                        key={tab}
                                                        onClick={() => setActiveTab(tab)}
                                                        className={`px-4.5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest shrink-0 transition-all select-none border ${
                                                            activeTab === tab
                                                            ? "bg-luxury-green-dark border-luxury-green-dark text-white shadow-premium scale-[1.02]"
                                                            : "bg-[#fbfbfa] hover:bg-gray-100 border-gray-200/60 text-slate-650"
                                                        }`}
                                                    >
                                                        {tab}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Tab Content */}
                                            <div className="min-h-[220px]">
                                                {activeTab === "SHOWCASE" && (
                                                    <div className="flex flex-col items-center justify-center">
                                                        {!showAllImages ? (
                                                            <>
                                                                <div className="w-full aspect-square max-w-[280px] bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-center shadow-3xs overflow-hidden">
                                                                    <img
                                                                        src={getImageUrl(validImages[0])}
                                                                        alt="Showcase item"
                                                                        className="max-w-[90%] max-h-[90%] object-contain pointer-events-none"
                                                                    />
                                                                </div>
                                                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider text-center mt-4.5 select-none">
                                                                    Official Product Showcase View – 1
                                                                </p>
                                                                
                                                                {validImages.length > 1 && (
                                                                    <button onClick={() => setShowAllImages(true)} className="mt-6 border border-gray-200 rounded-full px-5 py-2 flex items-center gap-1.5 text-[11px] font-extrabold text-gray-600 bg-white hover:bg-gray-50 transition-all shadow-3xs select-none active:scale-95">
                                                                        <span>Show More</span>
                                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                                                        </svg>
                                                                    </button>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <div className="w-full grid grid-cols-2 gap-4">
                                                                {validImages.map((img, idx) => (
                                                                    <div key={idx} className="flex flex-col items-center">
                                                                        <div className="w-full aspect-square bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-center shadow-3xs overflow-hidden">
                                                                            <img
                                                                                src={getImageUrl(img)}
                                                                                alt={`Showcase view ${idx + 1}`}
                                                                                className="max-w-[90%] max-h-[90%] object-contain pointer-events-none"
                                                                            />
                                                                        </div>
                                                                        <p className="text-[9px] font-bold uppercase text-gray-400 tracking-wider text-center mt-2 select-none">
                                                                            View – {idx + 1}
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                                <div className="col-span-2 flex justify-center mt-4">
                                                                    <button onClick={() => setShowAllImages(false)} className="border border-gray-200 rounded-full px-5 py-2 flex items-center gap-1.5 text-[11px] font-extrabold text-gray-600 bg-white hover:bg-gray-50 transition-all shadow-3xs select-none active:scale-95">
                                                                        <span>Show Less</span>
                                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {activeTab === "DESCRIPTION" && (
                                                    <div className="text-xs text-gray-650 font-medium leading-relaxed whitespace-pre-line bg-gray-50/40 border border-gray-50/50 p-4 rounded-xl">
                                                        {data.description}
                                                    </div>
                                                )}

                                                {/* Render dynamic key specifications */}
                                                {!["SHOWCASE", "DESCRIPTION"].includes(activeTab) && (
                                                    <div className="text-xs text-gray-655 font-medium leading-relaxed bg-gray-50/40 border border-gray-50/50 p-4 rounded-xl whitespace-pre-line">
                                                        {data.more_details && Object.entries(data.more_details).find(([k]) => k.toUpperCase() === activeTab)?.[1]}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                </div>





                {/* Related Products Section */}
                {(data?.relatedProducts?.length > 0 || (data?.category && data?.category[0])) && (
                    <div className='mt-12 mb-6'>
                        <CategoryWiseProductDisplay 
                            id={data.category?.[0]?._id} 
                            name="Related Products" 
                            manualData={data?.relatedProducts}
                        />
                    </div>
                )}

                {/* Reviews Section (Mobile Only - At Bottom) */}
                <div id="reviews-section" className='lg:hidden mt-10 border-t border-gray-100 pt-10 pb-24'>
                    <ReviewsSection 
                        productId={productId}
                        reviews={reviews}
                        setReviews={setReviews}
                        fetchReviews={fetchReviews}
                    />
                </div>
            </div>
        </div>
      </section>

      {/* Sticky Bottom Bar for Mobile */}
      <AnimatePresence>
        {showStickyBar && (
            <motion.div 
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className='lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 pb-8 flex items-center justify-between gap-4 z-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]'
            >
                <div className='flex flex-col'>
                    <div className='flex items-center gap-1.5'>
                        <p className='text-lg font-bold text-gray-900 leading-none'>
                            {DisplayPriceInRupees(pricewithDiscount(data.mrp || data.price, data.discount))}
                        </p>
                        <p className='text-[10px] text-gray-400 font-bold line-through'>
                            {DisplayPriceInRupees(data.mrp || data.price)}
                        </p>
                    </div>
                    <p className='text-[10px] font-bold text-gray-500'>
                        {data.unit}
                    </p>
                </div>
                <div className='w-32'>
                    {!(Number(data.stock) > 0) ? (
                        <div className='w-full bg-gray-50 text-gray-400/80 border border-gray-200/60 py-2 rounded-xl font-black text-center text-[11px] uppercase tracking-wider leading-tight select-none'>
                            OUT OF<br/>STOCK
                        </div>
                    ) : isNewlyCreated ? (
                        <button
                            onClick={handleBuyNow}
                            className="w-full h-10 bg-linear-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center shadow-premium cursor-pointer"
                        >
                            Pre-order
                        </button>
                    ) : (
                        <AddToCartButton data={data} variant="orange-full" />
                    )}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* 📦 OPEN BOX INSPECTION SERVICE MODAL */}
      <AnimatePresence>
        {showOpenBoxModal && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='fixed inset-0 bg-black/60 z-2500 flex items-center justify-center p-4 backdrop-blur-xs'
                onClick={() => setShowOpenBoxModal(false)}
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className='bg-white rounded-4xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]'
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className='flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50'>
                        <h3 className='text-lg font-black text-gray-900 tracking-tight'>Open Box Inspection Service</h3>
                        <button
                            onClick={() => setShowOpenBoxModal(false)}
                            className='p-2 hover:bg-gray-200/60 rounded-full transition-all text-gray-700'
                        >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className='p-6 overflow-y-auto space-y-6 text-gray-700'>
                        <p className='text-sm font-semibold leading-relaxed text-gray-600'>
                            <span className='font-black text-gray-900'>Worry-Free Experience:</span> To begin the open box inspection, we first need to verify the phone number used to place this order. Please share the last 4 digits of the phone number with the delivery associate. The delivery associate will open the item for your inspection. Share OTP only after inspecting your item.
                        </p>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='bg-green-50/40 border border-green-100/60 rounded-2xl p-4 flex flex-col items-center text-center space-y-2'>
                                <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700'>
                                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className='text-xs font-bold text-gray-800 leading-snug'>
                                    Verify your item is correct, damage-free and contains all accessories
                                </p>
                            </div>

                            <div className='bg-blue-50/40 border border-blue-100/60 rounded-2xl p-4 flex flex-col items-center text-center space-y-2'>
                                <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-750'>
                                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 4.5M20 4v5h-5" />
                                    </svg>
                                </div>
                                <p className='text-xs font-bold text-gray-800 leading-snug'>
                                    Refund support in case item is missing or damaged during doorstep inspection
                                </p>
                            </div>
                        </div>

                        <div className='border-t border-gray-100 pt-5 space-y-3.5 text-xs text-gray-650 font-medium leading-relaxed'>
                            <p>
                                <span className='font-black text-red-600 uppercase tracking-wider block mb-1'>Critical Notice</span>
                                You will <span className='font-black text-gray-900'>NOT be able to return or replace</span> the item for wrong item, physical damages or missing parts once the OTP is submitted.
                            </p>
                            <p>
                                Delivery associate will capture photos of opened items for internal records.
                            </p>
                            <p className='bg-gray-50 p-3 rounded-xl border border-gray-100 text-[11px] text-gray-500'>
                                <span className='font-bold text-gray-700'>Note:</span> This fee is for doorstep assistance services such as open box inspection and installation, where applicable.
                            </p>
                        </div>
                    </div>

                    <div className='px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between'>
                        <span className='text-[11px] text-indigo-600 hover:underline cursor-pointer font-bold'>Terms and conditions apply. Learn More.</span>
                        <button
                            onClick={() => setShowOpenBoxModal(false)}
                            className='bg-gray-900 hover:bg-gray-800 text-white font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm'
                        >
                            Got It
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen Image Modal */}
      <AnimatePresence>
          {isFullScreen && (
              isMobile ? (
                  /* MOBILE BLINKIT-STYLE MODAL */
                  <motion.div 
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                      className='fixed inset-0 z-2000 bg-white flex flex-col lg:hidden'
                  >
                      {/* Top Navigation Bar */}
                      <div className='flex items-center justify-between px-4 pt-12 pb-4 bg-white border-b border-gray-50'>
                          <span className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>Product View</span>
                          <button 
                              onClick={() => setIsFullScreen(false)}
                              className='p-2 text-gray-900 hover:bg-gray-100 rounded-full transition-all'
                          >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                          </button>
                      </div>

                      {/* Main Content Area */}
                      <div className='flex-1 flex flex-col min-h-0 bg-white'>
                          {/* Scrollable Image Gallery */}
                          <div 
                              ref={modalGalleryRef}
                              className='w-full flex-1 flex overflow-x-scroll snap-x snap-mandatory no-scrollbar'
                              onScroll={(e) => {
                                  const container = e.target;
                                  const index = Math.round(container.scrollLeft / container.offsetWidth);
                                  const totalMedia = mediaList.length;
                                  if (index !== image && index >= 0 && index < totalMedia) {
                                      setImage(index);
                                  }
                              }}
                          >
                              {mediaList.map((item, index) => (
                                  <div key={index} className='w-full min-w-full h-full shrink-0 snap-center snap-always flex items-center justify-center p-6'>
                                      {hasVideo && index === 0 ? (
                                          <video 
                                              src={getImageUrl(item)} 
                                              controls
                                              className='max-w-full max-h-full object-contain rounded-2xl'
                                          />
                                      ) : (
                                          <motion.img
                                              initial={{ scale: 0.9, opacity: 0 }}
                                              animate={{ scale: 1, opacity: 1 }}
                                              src={getImageUrl(item)}
                                              className='max-w-full max-h-full object-contain'
                                              alt={`${data?.name}-${index}`}
                                          /> 
                                      )}
                                  </div>
                              ))}
                          </div>

                          {/* Thumbnail Selector */}
                          <div className='px-4 py-6 bg-white'>
                              <div className='flex items-center gap-3 overflow-x-auto no-scrollbar'>
                                  {mediaList.map((item, index) => (
                                      <div 
                                          key={index}
                                          onClick={() => {
                                              setImage(index);
                                              if (modalGalleryRef.current) {
                                                  modalGalleryRef.current.scrollTo({
                                                      left: index * modalGalleryRef.current.offsetWidth,
                                                      behavior: 'auto'
                                                  });
                                              }
                                          }}
                                          className={`w-16 h-16 shrink-0 rounded-2xl border-2 transition-all duration-200 p-1 flex items-center justify-center
                                              ${index === image ? 'border-green-600 bg-green-50/50 scale-105' : 'border-gray-100 bg-white'}`}
                                      >
                                          {hasVideo && index === 0 ? (
                                              <div className='relative w-full h-full bg-black rounded-xl overflow-hidden flex items-center justify-center'>
                                                  {validImages[0] && (
                                                      <img src={getImageUrl(validImages[0], 150)} className='absolute inset-0 w-full h-full object-cover opacity-50' alt="video thumb" />
                                                  )}
                                                  <div className='absolute inset-0 flex items-center justify-center'>
                                                      <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 24 24">
                                                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                                                      </svg>
                                                  </div>
                                              </div>
                                          ) : (
                                              <img src={getImageUrl(item, 150)} className='w-full h-full object-contain' alt={`thumb-${index}`} />
                                          )}
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>

                      {/* Sticky Footer Section */}
                      <div className='bg-white border-t border-gray-100 px-6 py-6 pb-12 flex items-center justify-between gap-4 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]'>
                          <div className='flex flex-col'>
                              <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1'>{data.unit}</p>
                              <div className='flex items-center gap-2'>
                                  <p className='text-2xl font-black text-gray-900 leading-none tracking-tight'>
                                      {DisplayPriceInRupees(pricewithDiscount(data.mrp || data.price, data.discount))}
                                  </p>
                                  <div className='flex flex-col -space-y-1'>
                                      {data.discount > 0 && (
                                          <span className='text-[9px] font-black text-blue-600 uppercase'>{data.discount}% OFF</span>
                                      )}
                                      <p className='text-[10px] text-gray-400 font-bold line-through'>
                                          {DisplayPriceInRupees(data.mrp || data.price)}
                                      </p>
                                  </div>
                              </div>
                          </div>
                          <div className='w-32'>
                              {!(Number(data.stock) > 0) ? (
                                  <div className='w-full bg-gray-50 text-gray-400/80 border border-gray-200/60 py-2 rounded-xl font-black text-center text-[11px] uppercase tracking-wider leading-tight select-none'>
                                      Out of<br/>Stock
                                  </div>
                              ) : isNewlyCreated ? (
                                  <button
                                      onClick={handleBuyNow}
                                      className="w-full h-10 bg-linear-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center shadow-premium cursor-pointer"
                                  >
                                      Pre-order
                                  </button>
                              ) : (
                                  <AddToCartButton data={data} variant="orange-full" />
                              )}
                          </div>
                      </div>
                  </motion.div>
              ) : (
                  /* DESKTOP TRADITIONAL MODAL */
                  <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className='fixed inset-0 z-2000 bg-black/95 hidden lg:flex items-center justify-center p-20'
                      onClick={() => setIsFullScreen(false)}
                  >
                      <div 
                          className="relative w-full h-full flex items-center justify-center"
                          onClick={(e) => e.stopPropagation()}
                      >
                          {/* Close Button */}
                          <button 
                              onClick={() => setIsFullScreen(false)}
                              className='absolute top-0 right-0 text-white/70 hover:text-white bg-white/10 p-4 rounded-full transition-all'
                          >
                              ✕
                          </button>

                          {/* Navigation Arrows */}
                          {mediaList.length > 1 && (
                              <>
                                  <button 
                                      onClick={handlePrev}
                                      className='absolute left-10 text-white bg-white/10 p-5 rounded-full hover:bg-white/20 transition-all'
                                  >
                                      ←
                                  </button>
                                  <button 
                                      onClick={handleNext}
                                      className='absolute right-10 text-white bg-white/10 p-5 rounded-full hover:bg-white/20 transition-all'
                                  >
                                      →
                                  </button>
                              </>
                          )}

                          <motion.div 
                              key={image}
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className='w-full h-full flex items-center justify-center'
                          >
                              {hasVideo && image === 0 ? (
                                  <video 
                                      src={getImageUrl(data.video)} 
                                      controls
                                      autoPlay
                                      className='max-w-full max-h-full object-contain shadow-2xl rounded-2xl'
                                  />
                              ) : (
                                  <img 
                                      src={getImageUrl(mediaList[image])} 
                                      className='max-w-full max-h-full object-contain shadow-2xl' 
                                      alt="Full product view"
                                  />
                              )}
                          </motion.div>
                      </div>
                  </motion.div>
              )
          )}
      </AnimatePresence>
    </>
  )
}

export default ProductDisplay
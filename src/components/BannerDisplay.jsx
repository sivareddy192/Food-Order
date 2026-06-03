import React, { useEffect, useState } from 'react'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"
import { getImageUrl } from '../utils/getImageUrl'
import { Link } from 'react-router-dom'

const BannerDisplay = () => {
    const [banners, setBanners] = useState(() => {
        try {
            const cached = localStorage.getItem('cached_banners')
            return cached ? JSON.parse(cached) : []
        } catch (e) {
            return []
        }
    })
    const [loading, setLoading] = useState(banners.length === 0)
    const [currentImage, setCurrentImage] = useState(0)

    const fetchBanners = async () => {
        try {
            const response = await Axios({
                ...SummaryApi.getBanner
            })
            if (response.data.success) {
                const activeBanners = response.data.data.filter(b => b.isActive)
                setBanners(activeBanners)
                try {
                    localStorage.setItem('cached_banners', JSON.stringify(activeBanners))
                } catch (e) {}
            }
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBanners()
    }, [])

    useEffect(() => {
        if (banners.length > 1) {
            const interval = setInterval(() => {
                setCurrentImage(prev => (prev + 1) % banners.length)
            }, 5000)
            return () => clearInterval(interval)
        }
    }, [banners])

    if (loading) {
        return (
            <div className='w-full'>
                <div className='w-full aspect-video sm:aspect-21/9 lg:aspect-1375/410 bg-gray-100 dark:bg-neutral-800 animate-pulse'></div>
            </div>
        )
    }

    if (banners.length === 0) {
        return <div className='w-full aspect-video sm:aspect-21/9 lg:aspect-1375/410' />
    }

    return (
        <div className='w-full relative'>
            <div className='overflow-hidden relative'>
                <div 
                    className='flex transition-transform duration-700 ease-in-out will-change-transform'
                    style={{ transform: `translateX(-${currentImage * 100}%) translateZ(0)` }}
                >
                    {
                        banners.map((banner, index) => (
                            <div key={banner._id} className='w-full min-w-full shrink-0'>
                                {banner.link ? (
                                    <Link to={banner.link} className='block w-full h-full'>
                                        {/* Desktop */}
                                        {banner.imageDesktop && (
                                            <img 
                                                src={getImageUrl(banner.imageDesktop, 1400)} 
                                                alt={banner.name || `Banner ${index + 1}`}
                                                loading={index === 0 ? "eager" : "lazy"}
                                                className='hidden lg:block w-full aspect-1375/410 object-cover cursor-pointer hover:opacity-95 transition-opacity'
                                            />
                                        )}
                                        {/* Mobile */}
                                        {(banner.imageMobile || banner.imageDesktop) && (
                                            <div className='lg:hidden w-full px-4 pt-4 pb-8'>
                                                <div className='w-full aspect-16/10 sm:aspect-21/9 rounded-4xl overflow-hidden shadow-2xl shadow-gray-200/50 border border-gray-100/50'>
                                                    <img 
                                                        src={getImageUrl(banner.imageMobile || banner.imageDesktop, 640)} 
                                                        alt={banner.name || `Banner ${index + 1}-mobile`}
                                                        loading={index === 0 ? "eager" : "lazy"}
                                                        className='w-full h-full object-cover cursor-pointer active:scale-[0.98] transition-transform duration-300'
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </Link>
                                ) : (
                                    <>
                                        {/* Desktop */}
                                        {banner.imageDesktop && (
                                            <img 
                                                src={getImageUrl(banner.imageDesktop, 1400)} 
                                                alt={banner.name || `Banner ${index + 1}`}
                                                loading={index === 0 ? "eager" : "lazy"}
                                                className='hidden lg:block w-full aspect-1375/410 object-cover'
                                            />
                                        )}
                                        {/* Mobile */}
                                        {(banner.imageMobile || banner.imageDesktop) && (
                                            <div className='lg:hidden w-full px-4 pt-4 pb-8'>
                                                <div className='w-full aspect-16/10 sm:aspect-21/9 rounded-4xl overflow-hidden shadow-2xl shadow-gray-200/50 border border-gray-100/50'>
                                                    <img 
                                                        src={getImageUrl(banner.imageMobile || banner.imageDesktop, 640)} 
                                                        alt={banner.name || `Banner ${index + 1}-mobile`}
                                                        loading={index === 0 ? "eager" : "lazy"}
                                                        className='w-full h-full object-cover'
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ))
                    }
                </div>

                {/* Dots */}
                <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10'>
                    {
                        banners.map((_, index) => (
                            <button 
                                key={index}
                                onClick={() => setCurrentImage(index)}
                                className={`w-2 h-2 rounded-full transition-all ${currentImage === index ? "bg-white w-6" : "bg-white/50"}`}
                            />
                        ))
                    }
                </div>
                
                {
                    banners.length > 1 && (
                        <>
                            {/* Navigation Buttons */}
                            <button 
                                onClick={() => setCurrentImage(prev => (prev - 1 + banners.length) % banners.length)}
                                className='absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white z-10 transition'
                            >
                                <FaChevronLeft />
                            </button>
                            <button 
                                onClick={() => setCurrentImage(prev => (prev + 1) % banners.length)}
                                className='absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white z-10 transition'
                            >
                                <FaChevronRight />
                            </button>
                        </>
                    )
                }
            </div>
        </div>
    )
}

export default BannerDisplay

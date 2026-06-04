import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import ProductLoading from './ProductLoading'
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { useSelector } from 'react-redux'
import { valideURLConvert } from '../utils/valideURLConvert'
import ProductBox from './ProductBox'

const CategoryWiseProductDisplay = ({ id, name, manualData, hideNewTag }) => {
    
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const containerRef = useRef()
    const subCategoryData = useSelector(state => state.product.allSubCategory)

    const loadingCardNumber = new Array(6).fill(null)

    const fetchCategoryWiseProduct = async () => {
        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.getProductByCategory,
                data: { id }
            })

            const { data: resData } = response

            if (resData.success) {
                setData(resData.data)
            }
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (manualData && manualData.length > 0) {
            setData(manualData)
        } else if (id) {
            setData([])
            fetchCategoryWiseProduct()
        }
    }, [id, manualData])

    
    
    const redirectURL = (() => {
        if (!subCategoryData?.length) return "#"

        const subcategory = subCategoryData.find(sub =>
            sub.category?.some(c => c._id == id)
        )

        if (!subcategory) return "#"

        return `/${valideURLConvert(name)}-${id}/${valideURLConvert(subcategory?.name)}-${subcategory?._id}`
    })()


    const handleScrollRight = () => {
        containerRef.current.scrollLeft += 200
    }

    const handleScrollLeft = () => {
        containerRef.current.scrollLeft -= 200
    }

    if (!loading && data.length === 0) {
        return null
    }

    return (
        <div>
        <div className='container mx-auto px-4 py-6 flex items-center justify-between font-luxury-sans'>
            <h3 className='font-luxury-serif text-xl md:text-2.5xl text-slate-850 dark:text-gray-100 tracking-tight font-bold transition-colors'>
                {name || (manualData?.length > 0 ? "Related Products" : "")}
            </h3>
            {!manualData && (
                <Link to={redirectURL} className='text-luxury-green hover:text-luxury-green-dark font-bold text-sm lg:text-base transition-colors hover:underline decoration-luxury-gold/50 decoration-2 underline-offset-4'>
                    See All
                </Link>
            )}
        </div>
            

            <div className='relative flex items-center'>
                <div
                    className='flex gap-4 mb-9 md:gap-6 lg:gap-8 container mx-auto px-4 overflow-x-scroll scrollbar-none scroll-smooth'
                    ref={containerRef}
                >

                    {loading && loadingCardNumber.map((_, index) => (
                        <ProductLoading key={"LoadingBox" + index} />
                    ))}

                    {!loading && data?.map((p, index) => (
                        <ProductBox
                            key={p._id + "CategoryProduct" + index}
                            data={p}
                            hideNewTag={hideNewTag}
                            styleWidth="w-44 sm:w-52 lg:w-60 xl:w-64"
                        />
                    ))}
                   
                </div>

                <div className='w-full left-0 right-0 container mx-auto px-2 absolute hidden lg:flex justify-between'>
                    <button
                        onClick={handleScrollLeft}
                        className='z-10 relative bg-white dark:bg-neutral-900 hover:bg-gray-100 dark:hover:bg-neutral-800 shadow-lg text-lg p-2 rounded-full text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-neutral-800 transition-all'
                    >
                        <FaAngleLeft />
                    </button>

                    <button
                        onClick={handleScrollRight}
                        className='z-10 relative bg-white dark:bg-neutral-900 hover:bg-gray-100 dark:hover:bg-neutral-800 shadow-lg p-2 text-lg rounded-full text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-neutral-800 transition-all'
                    >
                        <FaAngleRight />
                    </button>
                </div>
                
            </div>
            
        </div>
        
    )
}

export default CategoryWiseProductDisplay

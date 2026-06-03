import React, { useEffect, useState } from 'react'
import ProductLoading from '../components/ProductLoading'
import SummaryApi from '../common/SummaryApi'
import Axios from '../utils/Axios'
import AxiosToastError from '../utils/AxiosToastError'
import ProductBox from '../components/ProductBox'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useLocation } from 'react-router-dom'
import monkey from '../assets/monkey-2.jpg'

const SearchPage = () => {
  const [data,setData] = useState([])
  const [loading,setLoading] = useState(true)
  const loadingArrayCard = new Array(10).fill(null)
  const [page,setPage] = useState(1)
  const [totalPage,setTotalPage] = useState(1)
  const params = useLocation()
  const searchText = params?.search?.slice(3)

  const fetchData = async() => {
    try {
      setLoading(true)
        const response = await Axios({
            ...SummaryApi.searchProduct,
            data : {
              search : searchText ,
              page : page,
            }
        })

        const { data : responseData } = response

        if(responseData.success){
            if(responseData.page == 1){
              setData(responseData.data)
            }else{
              setData((preve)=>{
                return[
                  ...preve,
                  ...responseData.data
                ]
              })
            }
            setTotalPage(responseData.totalPage)
            console.log(responseData)
        }
    } catch (error) {
        AxiosToastError(error)
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    fetchData()
  },[page,searchText])

  console.log("page",page)

  const handleFetchMore = ()=>{
    if(totalPage > page){
      setPage(preve => preve + 1)
    }
  }

  return (
    <section className='bg-gray-50 min-h-screen'>
      <div className='container mx-auto p-4 lg:p-8'>
        
        {/* Results Header */}
        <div className='mb-8 px-2'>
            <div className='flex items-center gap-3 mb-2'>
                <span className='w-8 h-1 bg-green-500 rounded-full'></span>
                <p className='text-[10px] font-black text-green-600 uppercase tracking-[4px]'>Search Explorer</p>
            </div>
            <div className='flex items-baseline gap-3'>
                <h2 className='text-xl lg:text-4xl font-black text-gray-900 tracking-tight lg:tracking-tighter'>
                    Results for "{searchText}"
                </h2>
                <span className='bg-white px-3 py-1 rounded-full text-[10px] lg:text-xs font-black text-gray-400 border border-gray-100 shadow-sm'>
                    {data.length} Items Found
                </span>
            </div>
        </div>

        <InfiniteScroll
          dataLength={data.length}
          hasMore={page < totalPage}
          next={handleFetchMore}
          className='overflow-visible'
        >
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-8'>
                
                {/* Initial Loading Skeletons */}
                {loading && data.length === 0 && (
                    loadingArrayCard.map((_,index)=>(
                        <ProductLoading key={"loadingsearchpage"+index}/>
                    ))
                )}

                {/* Search Results */}
                {data.map((p,index)=>(
                    <ProductBox data={p} key={p?._id+"searchProduct"+index}/>
                ))}

                {/* Infinite Loading Skeletons */}
                {loading && data.length > 0 && (
                    new Array(5).fill(null).map((_,index)=>(
                        <ProductLoading key={"loadingmoresearch"+index}/>
                    ))
                )}
          </div>
        </InfiniteScroll>

        {/* No Results UI */}
        {!data[0] && !loading && (
            <div className='flex flex-col items-center justify-center py-24 glass-card rounded-[3rem] mt-8'>
                <div className='w-40 h-40 bg-gray-50 rounded-full flex items-center justify-center mb-8'>
                    <img
                        src={monkey}
                        className='w-24 h-24 object-contain grayscale opacity-30'
                        alt="No Results"
                    />
                </div>
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-widest">No Matches Found</h3>
                <p className='text-sm text-gray-400 mt-2 font-bold uppercase tracking-widest'>Try searching for something else</p>
            </div>
        )
        }
      </div>
    </section>
  )

}

export default SearchPage

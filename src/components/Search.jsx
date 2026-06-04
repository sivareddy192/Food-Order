import React, { useEffect, useState } from 'react'
import { IoSearch } from "react-icons/io5";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
import { FaArrowLeft } from "react-icons/fa";
import useMobile from '../hooks/useMobile';


const Search = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const isSearchPage = location.pathname === "/search"
    const [ isMobile ] = useMobile()
    const searchText = location.search.slice(3)


    const redirectToSearchPage = ()=>{
        navigate("/search")
    }

    const handleOnChange = (e)=>{
        const value = e.target.value
        const url = `/search?q=${value}`
        navigate(url)
    }

  return (
    <div className='w-full min-w-[300px] lg:min-w-[420px] h-11 lg:h-12 rounded-2xl border border-gray-200/60 overflow-hidden flex items-center text-neutral-400 bg-[#f5f4f0]/65 group focus-within:bg-white focus-within:border-luxury-gold focus-within:ring-4 focus-within:ring-luxury-gold/15 transition-all duration-300 shadow-3xs'>
        <div>
            {
                (isMobile && isSearchPage ) ? (
                    <Link to={"/"} className='flex justify-center items-center h-full p-2 m-1 group-focus-within:text-luxury-green bg-white rounded-full shadow-md'>
                        <FaArrowLeft size={20}/>
                    </Link>
                ) :(
                    <button className='flex justify-center items-center h-full p-3 group-focus-within:text-luxury-green'>
                        <IoSearch size={22} className="text-luxury-gold" />
                    </button>
                )
            }
        </div>
        <div className='w-full h-full'>
            {
                !isSearchPage ? (
                     <div onClick={redirectToSearchPage} className='w-full h-full flex items-center'>
                        <TypeAnimation
                                sequence={[
                                    
                                    'Search "chicken pickle"',
                                    1500, 
                                    'Search "mango pickle"',
                                    1500,
                                    'Search "garlic pickle"',
                                    1500,
                                    'Search "tomato pickle"',
                                    1500,
                                    'Search "prawn pickle"',
                                    1500,
                                    'Search "mutton pickle"',
                                    1500,
                                    'Search "lime pickle"',
                                    1500,
                                    'Search "chilli pickle"',
                                ]}
                                wrapper="span"
                                speed={40}
                                style={{ fontSize: '1em', display: 'inline-block' }}
                                repeat={Infinity}
                            />
                     </div>
                ) : (
                    <div className='w-full h-full'>
                        <input
                            type='text'
                            id='search'
                            placeholder='Search for chicken pickle, mango pickle and more...'
                            autoFocus
                            defaultValue={searchText}
                            className='bg-transparent w-full h-full outline-none'
                            onChange={handleOnChange}
                        />
                    </div>
                )
            }
        </div>
        
    </div>
  )
}

export default Search

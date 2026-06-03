import React, { useEffect, useState } from 'react';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import ProductBox from '../components/ProductBox';
import Skeleton from '../components/Skeleton';
import { FaBoxOpen } from 'react-icons/fa';

const NewArrivals = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNewArrivals = async () => {
            try {
                setLoading(true);
                const response = await Axios({
                    ...SummaryApi.getProduct,
                    data: {
                        page: 1,
                        limit: 24 // Fetch up to 24 new items
                    }
                });
                
                if (response.data.success) {
                    const freshItems = (response.data.data || []).filter(product => {
                        if (!product.createdAt) return false;
                        const diffDays = (new Date().getTime() - new Date(product.createdAt).getTime()) / (1000 * 3600 * 24);
                        return diffDays < 3;
                    });
                    setData(freshItems);
                }
            } catch (error) {
                console.error("Failed to load new arrivals:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNewArrivals();
    }, []);

    return (
        <section className="container mx-auto px-4 py-8 lg:py-12 min-h-[60vh] font-luxury-sans">
            <div className="mb-10 text-center">
                <h1 className="text-3xl lg:text-4xl font-black text-luxury-green-dark font-luxury-serif uppercase tracking-widest mb-3">
                    New Arrivals
                </h1>
                <p className="text-gray-500 max-w-lg mx-auto">
                    Discover our latest premium additions. Expertly curated for your refined taste.
                </p>
                <div className="w-24 h-1 bg-luxury-gold mx-auto mt-6 rounded-full" />
            </div>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                    {new Array(10).fill(null).map((_, index) => (
                        <div key={`loading-${index}`} className="flex flex-col gap-3 p-4 bg-white rounded-3xl border border-gray-100 shadow-sm h-72">
                            <Skeleton className="w-full h-40 rounded-2xl" />
                            <Skeleton className="w-full h-4" />
                            <Skeleton className="w-3/4 h-4" />
                        </div>
                    ))}
                </div>
            ) : data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <FaBoxOpen className="text-6xl text-gray-200 mb-4" />
                    <h3 className="text-xl font-bold text-gray-600 font-luxury-serif">No New Arrivals Yet</h3>
                    <p className="text-gray-400 mt-2">Check back soon for new premium products.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 justify-items-center">
                    {data.map((product) => (
                        <ProductBox key={`new-arrival-${product._id}`} data={product} hideNewTag={true} />
                    ))}
                </div>
            )}
        </section>
    );
};

export default NewArrivals;

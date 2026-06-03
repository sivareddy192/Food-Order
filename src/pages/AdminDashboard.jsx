import React, { useEffect, useState } from 'react'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import {
    FaCheckCircle, FaTimesCircle, FaClock,
    FaShoppingCart, FaChartLine,
    FaSyncAlt
} from 'react-icons/fa'
import { getImageUrl } from '../utils/getImageUrl'
import { motion } from 'framer-motion'

const formatINR = (num) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num)

const StatCard = ({ icon, label, value, sub, color, iconBg }) => (
    <div className={`bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all`}>
        <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center text-lg ${iconBg}`}>
            {icon}
        </div>
        <div className='min-w-0'>
            <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 truncate'>{label}</p>
            <p className={`text-xl font-black ${color}`}>{value}</p>
        </div>
    </div>
)

const AdminDashboard = () => {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [lastRefresh, setLastRefresh] = useState(new Date())

    const fetchStats = async () => {
        try {
            setLoading(true)
            const res = await Axios({ ...SummaryApi.admin.getStats })
            if (res.data.success) {
                setStats(res.data.data)
                setLastRefresh(new Date())
            }
        } catch (err) {
            console.error('Stats fetch error:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
        const interval = setInterval(fetchStats, 60000)
        return () => clearInterval(interval)
    }, [])



    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    const buildChartData = () => {
        if (!stats?.dailyRevenue) return []
        const result = []
        for (let i = 6; i >= 0; i--) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const dayEntry = stats.dailyRevenue.find(
                e => e._id.day === d.getDate() && e._id.month === (d.getMonth() + 1) && e._id.year === d.getFullYear()
            )
            result.push({
                label: i === 0 ? 'Today' : days[d.getDay()],
                revenue: dayEntry?.revenue || 0,
                orders: dayEntry?.orders || 0,
            })
        }
        return result
    }

    const chartData = buildChartData()
    const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1)



    const orderStatusData = [
        { label: 'Pending', count: stats?.pendingCount || 0, color: 'bg-orange-500', hover: 'hover:bg-orange-400', shadow: 'shadow-orange-100', text: 'text-orange-500' },
        { label: 'Delivered', count: stats?.deliveredCount || 0, color: 'bg-green-500', hover: 'hover:bg-green-400', shadow: 'shadow-green-100', text: 'text-green-500' },
        { label: 'Cancelled', count: stats?.cancelledCount || 0, color: 'bg-red-500', hover: 'hover:bg-red-400', shadow: 'shadow-red-100', text: 'text-red-500' },
    ]
    const maxOrdersCount = Math.max(...orderStatusData.map(d => d.count), 1)

    if (loading && !stats) {
        return (
            <div className='p-4 lg:p-8 space-y-6'>
                <div className='flex justify-between items-center'>
                    <div className='h-8 bg-gray-200 rounded-2xl w-48 animate-pulse' />
                    <div className='h-10 bg-gray-200 rounded-2xl w-12 animate-pulse' />
                </div>
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
                    <div className='h-40 bg-gray-100 rounded-[2rem] animate-pulse' />
                    <div className='h-40 bg-gray-100 rounded-[2rem] animate-pulse hidden lg:block' />
                    <div className='h-40 bg-gray-100 rounded-[2rem] animate-pulse hidden lg:block' />
                </div>
                <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                    <div className='h-24 bg-gray-100 rounded-3xl animate-pulse' />
                    <div className='h-24 bg-gray-100 rounded-3xl animate-pulse' />
                    <div className='h-24 bg-gray-100 rounded-3xl animate-pulse' />
                    <div className='h-24 bg-gray-100 rounded-3xl animate-pulse' />
                </div>
            </div>
        )
    }

    return (
        <div className='p-4 lg:p-8 space-y-6 lg:space-y-10 max-w-7xl mx-auto overflow-hidden'>

            {/* Header Area */}
            <div className='flex items-center justify-between bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 lg:bg-transparent lg:p-0 lg:rounded-none lg:shadow-none lg:border-none'>
                <div className='min-w-0'>
                    <h1 className='text-xl lg:text-3xl font-black text-gray-900 flex items-center gap-2'>
                        <FaChartLine className='text-indigo-600 flex-shrink-0' /> 
                        Dashboard
                    </h1>
                    <p className='text-[10px] text-gray-400 mt-0.5 font-bold uppercase tracking-widest'>
                        Live Updates • {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                <button
                    onClick={fetchStats}
                    disabled={loading}
                    className='bg-indigo-600 text-white w-10 h-10 lg:w-auto lg:px-5 lg:py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all'
                >
                    <FaSyncAlt className={loading ? 'animate-spin' : ''} />
                    <span className='hidden lg:inline font-black text-xs uppercase tracking-widest'>Refresh</span>
                </button>
            </div>

            {/* Top Revenue Stats */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6'>
                <div className='bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-xl shadow-gray-200'>
                    <div className='absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10' />
                    <p className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'>Total Sales</p>
                    <p className='text-4xl font-black mb-4'>{formatINR(stats?.totalRevenue || 0)}</p>
                    <div className='inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold'>
                        <span className='w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse' />
                        {stats?.totalOrders || 0} Successful Orders
                    </div>
                </div>

                <div className='bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm'>
                    <p className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'>Today's Revenue</p>
                    <p className='text-3xl font-black text-gray-900'>{formatINR(stats?.todayRevenue || 0)}</p>
                    <div className='mt-4 flex items-center gap-2 text-green-600 text-xs font-bold uppercase tracking-widest'>
                        <FaShoppingCart /> {stats?.todayOrders || 0} Orders Today
                    </div>
                </div>

                <div className='bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm'>
                    <p className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'>Monthly Peak</p>
                    <p className='text-3xl font-black text-gray-900'>{formatINR(stats?.monthRevenue || 0)}</p>
                    <p className='text-xs text-gray-400 font-bold uppercase tracking-widest mt-4'>Current Cycle</p>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6'>
                <StatCard
                    icon={<FaShoppingCart className='text-indigo-600' />}
                    label='Total'
                    value={stats?.totalOrders || 0}
                    iconBg='bg-indigo-50'
                    color='text-indigo-700'
                />
                <StatCard
                    icon={<FaCheckCircle className='text-green-600' />}
                    label='Delivered'
                    value={stats?.deliveredCount || 0}
                    iconBg='bg-green-50'
                    color='text-green-700'
                />
                <StatCard
                    icon={<FaClock className='text-orange-500' />}
                    label='Pending'
                    value={stats?.pendingCount || 0}
                    iconBg='bg-orange-50'
                    color='text-orange-600'
                />
                <StatCard
                    icon={<FaTimesCircle className='text-red-500' />}
                    label='Cancelled'
                    value={stats?.cancelledCount || 0}
                    iconBg='bg-red-50'
                    color='text-red-600'
                />
            </div>

            {/* Weekly Analysis Chart */}
            <div className='bg-white rounded-[2.5rem] p-6 lg:p-10 border border-gray-100 shadow-sm'>
                <h2 className='text-xs font-black text-gray-400 uppercase tracking-[3px] mb-8'>Weekly Revenue Analysis</h2>
                <div className='overflow-x-auto no-scrollbar'>
                    <div className='flex items-end gap-3 lg:gap-8 h-56 min-w-[500px] lg:min-w-0 px-2'>
                        {chartData.map((d, i) => (
                            <div key={i} className='flex-1 flex flex-col items-center gap-3 group cursor-default'>
                                <div className='relative w-full flex flex-col items-center gap-2'>
                                    <p className='text-[10px] font-black text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 px-2 py-0.5 rounded shadow-sm z-10'>{formatINR(d.revenue)}</p>
                                    <motion.div
                                        initial={{ height: 4 }}
                                        whileInView={{ height: Math.max((d.revenue / maxRevenue) * 160, d.revenue > 0 ? 12 : 4) }}
                                        viewport={{ once: true, margin: "-20px" }}
                                        transition={{ type: "spring", stiffness: 100, damping: 15, delay: i * 0.1 }}
                                        className={`w-full max-w-[40px] rounded-2xl ${d.revenue > 0 ? 'bg-indigo-600 shadow-lg shadow-indigo-100 hover:bg-indigo-500' : 'bg-gray-50'}`}
                                    />
                                </div>
                                <p className={`text-[10px] font-black tracking-tight ${i === 6 ? 'text-indigo-600' : 'text-gray-400'} uppercase`}>{d.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Orders Status Overview Chart */}
            <div className='bg-white rounded-[2.5rem] p-6 lg:p-10 border border-gray-100 shadow-sm'>
                <h2 className='text-xs font-black text-gray-400 uppercase tracking-[3px] mb-8'>Orders Overview</h2>
                <div className='overflow-x-auto no-scrollbar'>
                    <div className='flex items-end justify-center gap-6 lg:gap-16 h-56 min-w-[300px] lg:min-w-0 px-2'>
                        {orderStatusData.map((d, i) => (
                            <div key={i} className='flex-1 max-w-[100px] flex flex-col items-center gap-3 group cursor-default'>
                                <div className='relative w-full flex flex-col items-center gap-2'>
                                    <p className='text-[12px] font-black text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 px-3 py-1 rounded shadow-sm z-10 whitespace-nowrap'>{d.count} Orders</p>
                                    <motion.div
                                        initial={{ height: 4 }}
                                        whileInView={{ height: Math.max((d.count / maxOrdersCount) * 160, d.count > 0 ? 12 : 4) }}
                                        viewport={{ once: true, margin: "-20px" }}
                                        transition={{ type: "spring", stiffness: 100, damping: 15, delay: i * 0.15 }}
                                        className={`w-full max-w-[60px] rounded-2xl ${d.color} shadow-lg ${d.shadow} ${d.hover}`}
                                    />
                                </div>
                                <p className={`text-[11px] font-black tracking-tight ${d.text} uppercase`}>{d.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Best Sellers & Distribution */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10'>
                {/* Top Products */}
                <div className='bg-white rounded-[2.5rem] p-6 lg:p-10 border border-gray-100 shadow-sm'>
                    <h2 className='text-xs font-black text-gray-400 uppercase tracking-[3px] mb-8'>Best Selling Products</h2>
                    <div className='space-y-5'>
                        {stats?.topProducts?.map((product, i) => (
                            <div key={i} className='flex items-center gap-4 group'>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                                    i === 0 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-gray-50 text-gray-400'
                                }`}>
                                    {i + 1}
                                </div>
                                {product.image && (
                                    <img
                                        src={getImageUrl(product.image)}
                                        className='w-14 h-14 object-contain bg-gray-50 rounded-2xl border border-gray-100 p-2 group-hover:scale-105 transition-transform'
                                    />
                                )}
                                <div className='flex-1 min-w-0'>
                                    <p className='font-black text-gray-800 text-sm truncate uppercase tracking-tight'>{product.name || 'Product'}</p>
                                    <p className='text-[10px] text-gray-400 font-bold uppercase mt-1'>{product.totalSold} Units Sold</p>
                                </div>
                                <div className='text-right'>
                                    <p className='font-black text-gray-900 text-sm'>{formatINR(product.revenue)}</p>
                                    <p className='text-[8px] font-black text-green-600 uppercase tracking-widest'>Revenue</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status Breakdown */}
                <div className='bg-white rounded-[2.5rem] p-6 lg:p-10 border border-gray-100 shadow-sm'>
                    <h2 className='text-xs font-black text-gray-400 uppercase tracking-[3px] mb-8'>Order Distribution</h2>
                    <div className='space-y-8 mt-4'>
                        {[
                            { label: 'Delivered', count: stats?.deliveredCount, color: 'bg-green-500', total: stats?.totalOrders },
                            { label: 'In Transit', count: stats?.pendingCount, color: 'bg-indigo-400', total: stats?.totalOrders },
                            { label: 'Cancelled', count: stats?.cancelledCount, color: 'bg-red-400', total: (stats?.totalOrders || 0) + (stats?.cancelledCount || 0) },
                        ].map(({ label, count, color, total }) => {
                            const pct = total > 0 ? Math.round((count / total) * 100) : 0
                            return (
                                <div key={label}>
                                    <div className='flex justify-between items-end mb-3'>
                                        <div>
                                            <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1'>{label}</p>
                                            <p className='text-xl font-black text-gray-900'>{count}</p>
                                        </div>
                                        <p className='text-sm font-black text-gray-900'>{pct}%</p>
                                    </div>
                                    <div className='w-full h-2 bg-gray-50 rounded-full overflow-hidden'>
                                        <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out shadow-sm`} style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard

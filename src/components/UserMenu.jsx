import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { logout } from '../store/userSlice'
import { clearCartItem } from '../store/cartProduct'
import { clearAddress } from '../store/addressSlice'
import { clearOrder } from '../store/orderSlice'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import isAdmin from '../utils/isAdmin'

const UserMenu = ({ close }) => {

  const user = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const wishlistCount = useSelector(state => state.wishlist.items.length)

  const handleLogout = async () => {
    try {
      const response = await Axios({ ...SummaryApi.logout })

      if (response?.data?.success) {
        close && close()
        dispatch(logout())
        dispatch(clearCartItem())
        dispatch(clearAddress())
        dispatch(clearOrder())
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        toast.success(response.data.message)
        navigate('/')
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }

  const handleClose = () => {
    close && close()
  }

  return (
    <div className='w-full max-w-[280px] bg-white dark:bg-neutral-900 rounded-4xl py-6 border border-gray-100 dark:border-neutral-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-colors'>

      {/* Header Section */}
      <div className='px-8 pb-6 border-b border-gray-50 dark:border-neutral-800 flex items-start justify-between'>
        <div>
          <h3 className='font-black text-2xl text-gray-900 dark:text-gray-100 leading-tight'>My Account</h3>
          <p className='text-sm text-gray-400 font-black tracking-tight mt-1'>{user?.mobile || 'No Mobile Number'}</p>
        </div>
        <button
          onClick={() => { navigate('/dashboard/profile'); close && close() }}
          className='bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-200 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-all active:scale-90'
        >
          Edit
        </button>
      </div>

      {/* Menu List */}
      <nav className='flex flex-col py-4'>

        {/* Admin Link */}
        {isAdmin(user?.role) && (
          <Link
            onClick={handleClose}
            to='/admin-portal/dashboard'
            className='px-8 py-3 text-sm font-black text-indigo-600 hover:bg-indigo-50/50 transition-colors uppercase tracking-widest border-b border-indigo-50/50 mb-2'
          >
            Admin Dashboard
          </Link>
        )}

        <Link
          onClick={handleClose}
          to='/dashboard/myorders'
          className='px-8 py-3.5 text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all flex items-center gap-3'
        >
          My Orders
        </Link>

        <Link
          onClick={handleClose}
          to='/dashboard/address'
          className='px-8 py-3.5 text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all flex items-center gap-3'
        >
          Saved Addresses
        </Link>

        {/* Wishlist */}
        <Link
          onClick={handleClose}
          to='/dashboard/wishlist'
          className='px-8 py-3.5 text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all flex items-center justify-between gap-3'
        >
          <span className='flex items-center gap-3'>
            My Wishlist
          </span>
          {wishlistCount > 0 && (
            <span className='bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full min-w-5 text-center'>
              {wishlistCount}
            </span>
          )}
        </Link>

        <Link
          onClick={handleClose}
          to='/dashboard/privacy'
          className='px-8 py-3.5 text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all flex items-center gap-3'
        >
          Account Privacy
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className='px-8 py-4 text-left text-base font-black text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all mt-4 border-t border-gray-50 dark:border-neutral-800 flex items-center gap-3'
        >
          Log Out
        </button>
      </nav>
    </div>
  )
}

export default UserMenu
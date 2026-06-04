import React, { useEffect, useState } from 'react'
import { useGlobalContext } from '../provider/GlobalProvider'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import ButtonLoading from './ButtonLoading'
import { useSelector } from 'react-redux'
import { FaMinus, FaPlus } from 'react-icons/fa6'

const AddToCartButton = ({ data, variant = 'green-pill' }) => {
    const { addItemToCart, updateCartItem, deleteCartItem } = useGlobalContext()
    const [loading, setLoading] = useState(false)
    const cartItem = useSelector(state => state.cartItem.cart)
    const [isAvailableCart, setIsAvailableCart] = useState(false)
    const [qty, setQty] = useState(0)
    const [cartItemDetails, setCartItemsDetails] = useState()

    const handleADDTocart = async (e) => {
        e.preventDefault()
        e.stopPropagation()

        try {
            setLoading(true)
            const res = await addItemToCart(data)
            if (res && res.success) {
                // Only toast for a genuine new add — skip the "already in cart" response
                if (res.message && !res.message.toLowerCase().includes('already')) {
                    toast.success(res.message)
                }
            }
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!data || !cartItem) return

        const productId = data._id || data.id
        if (!productId) return

        const normalize = (str) => (str || '').toString().replace(/\s+/g, '').toLowerCase()
        const currentUnit = normalize(data.unit)

        const product = cartItem.find(item => {
            const itemProductId = item.productId?._id || item.productId?.id || item.productId
            return itemProductId?.toString() === productId?.toString()
                && normalize(item.unit) === currentUnit
        })

        if (product) {
            setIsAvailableCart(true)
            setQty(product.quantity)
            setCartItemsDetails(product)
        } else {
            setIsAvailableCart(false)
            setQty(0)
            setCartItemsDetails(null)
        }
    }, [data, data.unit, cartItem])

    const increaseQty = async (e) => {
        e.preventDefault()
        e.stopPropagation()

        try {
            // Non-blocking update (no setLoading) for instant clicking experience
            await updateCartItem(cartItemDetails?._id, qty + 1)
        } catch (error) {
            AxiosToastError(error)
        }
    }

    const decreaseQty = async (e) => {
        e.preventDefault()
        e.stopPropagation()

        try {
            if (qty === 1) {
                // Deleting remains blocking as it removes the UI element
                setLoading(true)
                await deleteCartItem(cartItemDetails?._id)
            } else {
                // Non-blocking update (no setLoading) for instant clicking experience
                await updateCartItem(cartItemDetails?._id, qty - 1)
            }
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='w-full'>
            {isAvailableCart ? (
                <div className={
                    variant === 'orange-full'
                        ? `flex items-center justify-between bg-luxury-green text-white rounded-xl overflow-hidden h-9 lg:h-10 shadow-premium border border-luxury-green transition-opacity ${loading ? 'opacity-75' : ''} font-luxury-sans`
                        : `flex items-center justify-between bg-luxury-green text-white rounded-full overflow-hidden h-9 shadow-premium border border-luxury-green transition-opacity ${loading ? 'opacity-75' : ''} font-luxury-sans`
                }>
                    <button
                        onClick={decreaseQty}
                        disabled={loading}
                        className='hover:bg-luxury-green-dark w-10 h-full flex items-center justify-center transition-all active:scale-90 disabled:opacity-50 cursor-pointer'
                    >
                        <FaMinus size={10} />
                    </button>
                    <span className='flex-1 text-center font-bold text-[12px] lg:text-sm tabular-nums'>{qty}</span>
                    <button
                        onClick={increaseQty}
                        disabled={loading}
                        className='hover:bg-luxury-green-dark w-10 h-full flex items-center justify-center transition-all active:scale-90 disabled:opacity-50 cursor-pointer'
                    >
                        <FaPlus size={10} />
                    </button>
                </div>
            ) : (
                variant === 'orange-full' ? (
                    <button
                        onClick={handleADDTocart}
                        disabled={loading}
                        className='w-full h-9 lg:h-10 bg-luxury-gold-gradient hover:opacity-95 text-white font-bold rounded-xl text-[9.5px] lg:text-xs uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center shadow-premium disabled:opacity-70 cursor-pointer font-luxury-sans'
                    >
                        {loading ? <ButtonLoading /> : 'Add to cart'}
                    </button>
                ) : (
                    <button
                        onClick={handleADDTocart}
                        disabled={loading}
                        className='w-full h-9 bg-white text-luxury-green border-2 border-luxury-green hover:bg-luxury-green hover:text-white font-bold rounded-full text-[9.5px] uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center shadow-premium disabled:opacity-70 cursor-pointer font-luxury-sans'
                    >
                        {loading ? <ButtonLoading /> : 'Add'}
                    </button>
                )
            )}
        </div>
    )
}

export default AddToCartButton
import React, { useState, useEffect } from 'react'
import { useGlobalContext } from '../provider/GlobalProvider'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import AddAddress from '../components/AddAddress'
import { useSelector } from 'react-redux'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const CheckoutPage = () => {
  const { 
    notDiscountTotalPrice, 
    totalPrice, 
    totalQty, 
    deliveryCharge, 
    handlingCharge, 
    couponDiscount, 
    appliedCoupon,
    setAppliedCoupon,
    fetchCartItem, 
    fetchOrder,
    fetchUser,
    fetchAddress
  } = useGlobalContext()
  
  const [openAddress, setOpenAddress] = useState(false)
  const [processing, setProcessing] = useState(false)
  const addressList = useSelector(state => state.addresses.addressList)
  const [selectAddress, setSelectAddress] = useState(null)
  const cartItemsList = useSelector(state => state.cartItem.cart || [])
  const totalCartQty = cartItemsList.reduce((sum, item) => sum + (item.quantity || 1), 0)
  const navigate = useNavigate()
  const [loadingScreen, setLoadingScreen] = useState(true)
  const token = localStorage.getItem('accessToken')

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true })
    }
  }, [token, navigate])

  useEffect(() => {
    const timer = setTimeout(() => setLoadingScreen(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const getCheckoutDeliveryDate = (pin, totalQty) => {
    const firstDigit = pin ? pin.charAt(0) : '';
    let baseStart = 3;
    
    if (firstDigit === '1') {
      baseStart = 3;
    } else if (firstDigit === '2') {
      baseStart = 4;
    } else if (firstDigit === '3') {
      baseStart = 5;
    } else if (firstDigit === '4') {
      baseStart = 4;
    } else if (firstDigit === '5') {
      baseStart = 3;
    } else if (firstDigit === '6') {
      baseStart = 2;
    } else {
      baseStart = 3;
    }
    const hasSameItemSpeedup = cartItemsList.some(item => (item.quantity || 1) >= 2);
    const cartQtyOffset = (totalQty <= 1 && !hasSameItemSpeedup) ? 3 : 0;
    const startOffset = baseStart + cartQtyOffset;

    const deliveryDate = new Date(Date.now() + startOffset * 24 * 60 * 60 * 1000);
    return deliveryDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  useEffect(() => {
    if (fetchAddress) fetchAddress()
  }, [])

  const grandTotal = totalPrice + deliveryCharge + handlingCharge - couponDiscount

  const handleCashOnDelivery = async () => {
    if (processing) return;
    try {
      if (selectAddress === null || !addressList[selectAddress]) {
        toast.error("Please select a delivery address");
        return;
      }
      setProcessing(true);
      toast.loading("Placing order...", { id: "cod-load" });

      const response = await Axios({
        ...SummaryApi.CashOnDeliveryOrder,
        data: {
          list_items: cartItemsList,
          addressId: addressList[selectAddress]?._id,
          subTotalAmt: totalPrice,
          totalAmt: grandTotal,
          discountAmt: couponDiscount,
          couponCode: appliedCoupon?.code || "",
          deliveryCharge: deliveryCharge,
          handlingCharge: handlingCharge,
        }
      })

      const { data: responseData } = response

      if (responseData.success) {
        toast.success(responseData.message)
        if (setAppliedCoupon) setAppliedCoupon(null)
        if (fetchCartItem) fetchCartItem()
        if (fetchOrder) fetchOrder()
        if (fetchUser) fetchUser()

        navigate('/success', {
          state: { text: "Order" }
        })
      }

    } catch (error) {
      AxiosToastError(error)
    } finally {
      setProcessing(false);
      toast.dismiss("cod-load");
    }
  }

  // const handleOnlinePayment = async () => {
  //   if (processing) return;
  //   try {
  //     if (selectAddress === null || !addressList[selectAddress]) {
  //       toast.error("Please select a delivery address");
  //       return;
  //     }
  //     setProcessing(true);
  //     toast.loading("Loading Stripe Checkout...", { id: "stripe-load" });
  //
  //     const response = await Axios({
  //       ...SummaryApi.payment_url,
  //       data: {
  //         list_items: cartItemsList,
  //         addressId: addressList[selectAddress]?._id,
  //         subTotalAmt: totalPrice,
  //         totalAmt: grandTotal,
  //         deliveryCharge: deliveryCharge,
  //         handlingCharge: handlingCharge,
  //         couponDiscount: couponDiscount,
  //         couponId: appliedCoupon?._id
  //       },
  //     });
  //
  //     toast.dismiss();
  //     const session = response.data;
  //
  //     if (!session.url) {
  //       toast.error("Stripe Checkout URL missing");
  //       return;
  //     }
  //
  //     window.location.href = session.url;
  //
  //   } catch (error) {
  //     AxiosToastError(error);
  //   } finally {
  //     setProcessing(false);
  //     toast.dismiss("stripe-load");
  //   }
  // };

  if (loadingScreen) {
    return (
      <section className='bg-blue-50 dark:bg-neutral-950 min-h-screen p-4 lg:p-10'>
        <div className='container mx-auto flex flex-col lg:flex-row gap-8 animate-pulse'>
          <div className='w-full h-64 bg-white dark:bg-neutral-900 rounded-4xl border border-gray-100 dark:border-neutral-800' />
          <div className='w-full max-w-md h-96 bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-gray-100 dark:border-neutral-800' />
        </div>
      </section>
    )
  }

  return (
    <section className='bg-blue-50 dark:bg-neutral-950 min-h-screen transition-colors duration-300'>
      <div className='container mx-auto p-4 flex flex-col lg:flex-row w-full gap-5 justify-between'>

        {/* Address Section */}
        <div className='w-full'>
          <h3 className='text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest mb-4'>Choose delivery address</h3>

          <div className='bg-white dark:bg-neutral-900 p-4 lg:p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-neutral-800 grid gap-4 transition-colors'>
            {addressList.map((address, index) => {
              const id = "address" + index;
              
              return (
                <div
                  key={address._id || index}
                  className={!address.status ? "hidden" : ""}
                >
                  <div 
                    onClick={() => setSelectAddress(index)}
                    className={`border-2 rounded-2xl p-4 flex gap-4 hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer transition-all ${selectAddress === index ? "border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md scale-[1.01]" : "border-gray-100 dark:border-neutral-800 glass-panel"}`}
                  >

                    <input
                      id={id}
                      type='radio'
                      value={index}
                      checked={selectAddress === index}
                      onChange={(e) => setSelectAddress(Number(e.target.value))}
                      name='address'
                      className='accent-green-600'
                    />

                    <label htmlFor={id} className='cursor-pointer flex-1'>
                      <p className='font-black text-gray-900 dark:text-gray-100 tracking-tight'>{address.address_line}</p>
                      <p className='text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5'>{address.city}, {address.state}</p>
                      <p className='text-xs font-bold text-gray-400 dark:text-gray-500'>{address.country} - {address.pincode}</p>
                      <p className='text-sm text-gray-700 dark:text-gray-300 font-bold mt-2 flex items-center gap-1.5'>
                          <span className='text-base'>📱</span> {address.mobile}
                      </p>
                      <div className='mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-black uppercase tracking-wider rounded-lg border border-green-200/50 dark:border-green-800/30 shadow-sm'>
                        <span className='w-1.5 h-1.5 bg-green-600 dark:bg-green-400 rounded-full animate-pulse' />
                        Estimated Delivery: {getCheckoutDeliveryDate(address.pincode, totalCartQty)}
                      </div>
                    </label>

                  </div>
                </div>
              )
            })}

            <div
              onClick={() => setOpenAddress(true)}
              className='h-16 bg-gray-50 dark:bg-neutral-800/50 border-2 border-dashed border-gray-200 dark:border-neutral-700 flex justify-center items-center cursor-pointer font-black text-[11px] uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all rounded-2xl'
            >
              + Add New Address
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className='w-full max-w-md p-8 rounded-[2.5rem] glass-card text-gray-900 dark:text-gray-100 h-fit sticky top-24 transition-colors'>
          <h3 className='text-[10px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-[0.3em] mb-8'>Bill Summary</h3>

          <div className='space-y-5'>
            <div className='flex justify-between text-xs font-bold'>
              <p className='text-gray-900 dark:text-gray-100 uppercase tracking-wider'>Items Total</p>
              <div className='text-right'>
                <span className='line-through text-gray-400 dark:text-gray-500 text-[10px] mr-2 italic'>{DisplayPriceInRupees(notDiscountTotalPrice)}</span>
                <span className='text-gray-900 dark:text-gray-100'>{DisplayPriceInRupees(totalPrice)}</span>
              </div>
            </div>

            <div className='flex justify-between text-xs font-bold'>
              <p className='text-gray-900 dark:text-gray-100 uppercase tracking-wider'>Delivery</p>
              <p className={deliveryCharge === 0 ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-gray-100"}>
                {deliveryCharge === 0 ? "FREE" : DisplayPriceInRupees(deliveryCharge)}
              </p>
            </div>

            {handlingCharge > 0 && (
              <div className='flex justify-between text-xs font-bold'>
                <p className='text-gray-900 dark:text-gray-100 uppercase tracking-wider'>Handling</p>
                <p className='text-gray-900 dark:text-gray-100'>{DisplayPriceInRupees(handlingCharge)}</p>
              </div>
            )}

            {couponDiscount > 0 && (
                <div className='flex justify-between text-xs font-black text-green-400 bg-green-400/10 p-3 rounded-2xl border border-green-400/20'>
                    <p className='uppercase tracking-widest'>Discount ({appliedCoupon?.code})</p>
                    <p>- {DisplayPriceInRupees(couponDiscount)}</p>
                </div>
            )}

            <div className='border-t border-gray-100 dark:border-neutral-800 pt-6 flex justify-between items-end mt-6'>
                <div>
                    <p className='text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1'>Grand Total</p>
                    <p className='text-4xl font-black text-gray-900 dark:text-white tracking-tighter'>{DisplayPriceInRupees(grandTotal)}</p>
                </div>
            </div>
          </div>

          <div className='w-full flex flex-col gap-4 mt-10'>
            {selectAddress === null && (
              <p className='text-red-400 text-[10px] font-black uppercase tracking-widest text-center animate-pulse'>
                {addressList.length === 0 ? "Please add an address first" : "Please select an address to proceed"}
              </p>
            )}
            
            {/* Online Payment — temporarily disabled
            <button
              className={`py-4 px-6 rounded-2xl text-white font-black uppercase text-[11px] active:scale-95 transition-all shadow-lg ${
                (selectAddress === null || processing) 
                ? "bg-gray-300 dark:bg-neutral-700 cursor-not-allowed shadow-none opacity-50 text-gray-500" 
                : "bg-green-600 hover:bg-green-700 shadow-green-600/20"
              }`}
              onClick={handleOnlinePayment}
              disabled={selectAddress === null || processing}
            >
              {processing ? "Processing..." : "Pay Online (Stripe)"}
            </button>
            */}

            <button
              className={`py-4 px-6 border-2 font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl transition-all active:scale-95 ${
                (selectAddress === null || processing)
                ? "border-gray-100 dark:border-neutral-800 text-gray-400 cursor-not-allowed opacity-50"
                : "border-gray-200 dark:border-neutral-800 hover:border-green-500 dark:hover:border-green-500 text-gray-900 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-400"
              }`}
              onClick={handleCashOnDelivery}
              disabled={selectAddress === null || processing}
            >
              {processing ? "Processing..." : "Cash on Delivery"}
            </button>
          </div>
        </div>
      </div>

      {openAddress && <AddAddress close={() => setOpenAddress(false)} />}
      {processing && <OrderPlacingOverlay />}
    </section>
  )
}

const OrderPlacingOverlay = () => {
  const [step, setStep] = useState(0);
  const steps = [
    "Verifying delivery address...",
    "Securing checkout connection...",
    "Packing your selected items...",
    "Assigning nearest delivery partner...",
    "Finalizing order details..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl border border-gray-100 dark:border-neutral-800 flex flex-col items-center">
        {/* Animated Icon Container */}
        <div className="relative w-28 h-28 mb-6 flex items-center justify-center bg-green-50 dark:bg-green-950/20 rounded-full border-2 border-green-100 dark:border-green-900/30">
          {/* Pulsing ring */}
          <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping" />
          
          {/* Inner Spinning Ring */}
          <div className="absolute inset-2 rounded-full border-4 border-dashed border-green-600 dark:border-green-400 animate-spin [animation-duration:10s]" />
          
          {/* Icon */}
          <div className="relative text-green-600 dark:text-green-400 text-4xl animate-bounce">
            🛍️
          </div>
        </div>

        {/* Text Details */}
        <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Placing Order</h4>
        <p className="text-[10px] text-green-600 dark:text-green-400 font-black uppercase tracking-wider mt-1">Pickle Live Checkout</p>

        {/* Current status message */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-6 h-8 font-medium max-w-[250px]">
          {steps[step]}
        </p>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-100 dark:bg-neutral-800 rounded-full mt-4 overflow-hidden relative">
          <div 
            className="h-full bg-green-600 dark:bg-green-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Bottom branding */}
        <span className="text-[8px] font-bold text-gray-300 dark:text-neutral-600 uppercase tracking-widest mt-6">
          pickle grocery services
        </span>
      </div>
    </div>
  );
};

export default CheckoutPage

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { useDispatch, useSelector } from "react-redux";
import {
  clearCartItem,
  handleAddItemCart,
  updateCartItemQtyOptimistic,
  addCartItemOptimistic,
} from "../store/cartProduct";

import toast from "react-hot-toast";
import { pricewithDiscount } from "../utils/PriceWithDiscount";
import { clearAddress, handleAddAddress } from "../store/addressSlice";
import { clearOrder, setOrder } from "../store/orderSlice";
import { setUserDetails } from "../store/userSlice";

export const GlobalContext = createContext(null);
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const dispatch = useDispatch();

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const updateTimers = useRef({});

  const cartItem = useSelector((state) => state.cartItem.cart);
  const user = useSelector((state) => state?.user);

  // ✅ FETCH USER
  const fetchUser = useCallback(async () => {
    try {
      const response = await Axios({
        ...SummaryApi.userDetails,
      });
      const { data: responseData } = response;
      if (responseData.success) {
        dispatch(setUserDetails(responseData.data));
      }
    } catch (error) {
      console.log("Error fetching user details:", error);
    }
  }, [dispatch]);

  // ✅ FETCH CART
  const fetchCartItem = useCallback(async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getCartItem,
      });

      const { data: responseData } = response;

      if (responseData.success) {
        dispatch(handleAddItemCart(responseData.data));
      }
    } catch (error) {
      console.log("Error fetching cart items:", error);
    }
  }, [dispatch]);

  // ✅ ADD ITEM TO CART
  const addItemToCart = async (product) => {
      if(!product?._id) return;
      
      // ⚡ 1. OPTIMISTIC RENDER: Create synthetic temporary cart item and push immediately!
      const tempId = "temp_" + Date.now();
      const syntheticItem = {
          _id: tempId,
          productId: product, // Object containing details needed by components
          quantity: 1,
          unit: product.unit || ""
      };
      
      dispatch(addCartItemOptimistic(syntheticItem));

      try {
          const response = await Axios({
              ...SummaryApi.addTocart,
              data: {
                  productId: product._id.toString(),
                  unit: product.unit?.toString() || ""
              }
          });

          const { data: responseData } = response;
          
          // Always refresh true state from DB once settled to finalize correct IDs
          fetchCartItem(); 
          
          return responseData;
      } catch (error) {
          fetchCartItem(); // Revert synthetic UI on error by hard refresh
          throw error;
      }
  };

  // ✅ UPDATE CART QTY (with Debounced Network Requests & Optimistic UI)
  const updateCartItem = (id, qty) => {
    // 🚀 1. OPTIMISTIC UI UPDATE: Push instantly so UI reacts in 1ms
    dispatch(updateCartItemQtyOptimistic({ _id: id, qty: qty }));

    // ⚡ 2. DEBOUNCE THE BACKEND NETWORK CALL (to prevent database thrashing & race conditions)
    return new Promise((resolve, reject) => {
        // Clear any pending update request for this item
        if (updateTimers.current[id]) {
            clearTimeout(updateTimers.current[id].timeout);
        }

        // Set a new timeout to execute the network request after 350ms
        const timeout = setTimeout(async () => {
            try {
                const response = await Axios({
                    ...SummaryApi.updateCartItemQty,
                    data: {
                        _id: id,
                        qty: qty,
                    },
                });

                const { data: responseData } = response;

                if (responseData.success) {
                    resolve(responseData);
                } else {
                    // Revert to database state if backend explicitly rejects
                    fetchCartItem();
                    reject(new Error("Update failed"));
                }
            } catch (error) {
                // Revert on network failure
                fetchCartItem();
                reject(error);
            } finally {
                delete updateTimers.current[id];
            }
        }, 350);

        updateTimers.current[id] = { timeout, resolve, reject };
    });
  };

  // ✅ DELETE CART ITEM
  const deleteCartItem = useCallback(async (cartId) => {
    const response = await Axios({
      ...SummaryApi.deleteCartItem,
      data: {
        _id: cartId,
      },
    });

    const { data: responseData } = response;

    if (responseData.success) {
      toast.success(responseData.message);
      fetchCartItem();
    }
  }, [fetchCartItem]);

  // ✅ CALCULATIONS
  const validItems = Array.isArray(cartItem) ? cartItem.filter(item => item?.productId) : [];

  const totalQty = validItems.reduce((prev, curr) => prev + (curr.quantity || 0), 0);

  const totalPrice = validItems.reduce((prev, curr) => {
    let price = curr?.productId?.price || 0;
    let discount = curr?.productId?.discount || 0;

    if (curr.unit && curr.unit !== curr.productId?.unit) {
      const variant = curr.productId?.variants?.find(v => v.unit === curr.unit);
      if (variant) {
        price = variant.price;
        discount = variant.discount;
      }
    }

    const priceAfterDiscount = pricewithDiscount(price, discount);
    return prev + priceAfterDiscount * (curr.quantity || 0);
  }, 0);

  const notDiscountTotalPrice = validItems.reduce((prev, curr) => {
    let price = curr?.productId?.price || 0;
    if (curr.unit && curr.unit !== curr.productId?.unit) {
      const variant = curr.productId?.variants?.find(v => v.unit === curr.unit);
      if (variant) price = variant.price;
    }
    return prev + price * (curr.quantity || 0);
  }, 0);

  const deliveryCharge = totalQty > 0 ? (totalPrice < 199 ? 30 : 0) : 0;
  const handlingCharge = totalQty > 0 ? (totalPrice > 199 ? 9 : 0) : 0;

  // Let's use a targeted useEffect to remove the coupon if minAmount is no longer met (asynchronously to satisfy linter)
  useEffect(() => {
    if (appliedCoupon && totalPrice < (appliedCoupon.minAmount || 0)) {
        Promise.resolve().then(() => {
            setAppliedCoupon(null);
            toast.error(`Coupon removed: Minimum order of ₹${appliedCoupon.minAmount} required`);
        });
    }
  }, [totalPrice, appliedCoupon]);

  const couponDiscount = (() => {
    if (!appliedCoupon || totalPrice < (appliedCoupon.minAmount || 0)) return 0;
    let discount = Math.ceil((totalPrice * appliedCoupon.discountPercent) / 100);
    if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
        discount = appliedCoupon.maxDiscount;
    }
    return discount;
  })();

  // ✅ FETCH ADDRESS
  const fetchAddress = useCallback(async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getAddress,
      });

      const { data: responseData } = response;

      if (responseData.success) {
        dispatch(handleAddAddress(responseData.data));
      }
    } catch (error) {
      console.log("Error fetching address details:", error);
    }
  }, [dispatch]);

  // ✅ FETCH ORDERS
  const fetchOrder = useCallback(async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getOrderItems,
      });

      const { data: responseData } = response;

      if (responseData.success) {
        dispatch(setOrder(responseData.data));
      }
    } catch (error) {
      console.log("Error fetching order details:", error);
    }
  }, [dispatch]);

  // ✅ INITIAL LOAD
  useEffect(() => {
    if (!user?._id) {
      dispatch(clearCartItem());
      dispatch(clearAddress());
      dispatch(clearOrder());
      return;
    }

    fetchCartItem();
    fetchAddress();
    fetchOrder();
  }, [user, fetchCartItem, fetchAddress, fetchOrder, dispatch]);

  // 🔥🔥🔥 NEW: LISTEN FOR CART UPDATE EVENT
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCartItem();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, [fetchCartItem]);

  return (
    <GlobalContext.Provider
      value={{
        fetchCartItem,
        addItemToCart,
        updateCartItem,
        deleteCartItem,
        deliveryCharge,
        handlingCharge,
        couponDiscount,
        appliedCoupon,
        setAppliedCoupon,
        totalPrice,
        totalQty,
        notDiscountTotalPrice,
        fetchOrder,
        fetchUser,
        fetchAddress,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
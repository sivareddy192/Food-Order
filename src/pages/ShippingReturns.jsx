import React from 'react';

const ShippingReturns = () => {
  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl min-h-[50vh]">
      <h1 className="text-3xl lg:text-4xl font-black text-[#0e3e26] mb-6 font-luxury-serif">Shipping & Returns</h1>
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-gray-600">
        <h3 className="text-xl font-bold text-gray-800 mb-3">Premium Delivery Services</h3>
        <p className="mb-6">We provide white-glove delivery services to ensure your luxury groceries arrive in pristine condition, perfectly temperature-controlled.</p>
        
        <h3 className="text-xl font-bold text-gray-800 mb-3">Return Policy</h3>
        <p>Due to the perishable nature of our premium items, we evaluate returns on a case-by-case basis. If your items arrive damaged or sub-standard, please contact our concierge service within 24 hours for a full replacement or refund.</p>
      </div>
    </div>
  );
};

export default ShippingReturns;

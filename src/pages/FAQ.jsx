import React from 'react';

const FAQ = () => {
  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl min-h-[50vh]">
      <h1 className="text-3xl lg:text-4xl font-black text-luxury-green-dark mb-6 font-luxury-serif">Frequently Asked Questions</h1>
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">How fast is delivery?</h3>
          <p className="text-gray-600 text-sm">We offer premium same-day and next-day delivery depending on your location and the time of order.</p>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Are your products organic?</h3>
          <p className="text-gray-600 text-sm">Yes, we pride ourselves on sourcing the finest organic ingredients from top-tier farms globally.</p>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Can I modify my order?</h3>
          <p className="text-gray-600 text-sm">Orders can be modified within 1 hour of placement through your dashboard or by contacting support.</p>
        </div>
      </div>
    </div>
  );
};

export default FAQ;

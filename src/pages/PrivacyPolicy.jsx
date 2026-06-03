import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl min-h-[50vh]">
      <h1 className="text-3xl lg:text-4xl font-black text-luxury-green-dark mb-6 font-luxury-serif">Privacy Policy</h1>
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm prose prose-sm max-w-none text-gray-600">
        <p className="mb-4">At Pickle, we take your privacy with the utmost seriousness. This policy outlines how we handle your personal data.</p>
        <h3 className="text-gray-800 font-bold mb-2">1. Data Collection</h3>
        <p className="mb-4">We collect information that you provide directly to us, such as when you create an account, make a purchase, or communicate with us.</p>
        <h3 className="text-gray-800 font-bold mb-2">2. Data Usage</h3>
        <p className="mb-4">We use the information we collect to deliver our premium services, process transactions securely, and send you relevant updates.</p>
        <h3 className="text-gray-800 font-bold mb-2">3. Data Security</h3>
        <p>Your data is protected using enterprise-grade encryption and security protocols to ensure your information remains confidential.</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

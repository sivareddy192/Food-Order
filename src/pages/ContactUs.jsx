import React, { useState } from 'react';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';

const ContactUs = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!data.name || !data.email || !data.message) {
      toast.error("Please fill out all fields.");
      return;
    }
    
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.submitContact,
        data: data
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setData({
          name: "",
          email: "",
          message: ""
        });
      } else {
        toast.error(response.data.message || "Failed to send message");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl min-h-[50vh]">
      <h1 className="text-3xl lg:text-4xl font-black text-luxury-green-dark mb-6 font-luxury-serif">Contact Us</h1>
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <p className="text-gray-600 mb-6 font-luxury-sans">
          We would love to hear from you. For inquiries about our premium products or your recent orders, please reach out.
        </p>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input 
            type="text" 
            name="name"
            value={data.name}
            onChange={handleChange}
            placeholder="Your Name" 
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-luxury-gold transition-colors font-luxury-sans" 
          />
          <input 
            type="email" 
            name="email"
            value={data.email}
            onChange={handleChange}
            placeholder="Your Email" 
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-luxury-gold transition-colors font-luxury-sans" 
          />
          <textarea 
            name="message"
            value={data.message}
            onChange={handleChange}
            placeholder="Your Message" 
            rows="5" 
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-luxury-gold transition-colors font-luxury-sans"
          ></textarea>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`font-bold py-3 rounded-xl transition-colors mt-2 font-luxury-sans uppercase tracking-widest text-sm ${loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-luxury-green-dark hover:bg-luxury-green text-white active:scale-[0.98]'}`}
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;

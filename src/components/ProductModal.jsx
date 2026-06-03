import React, { useEffect } from 'react'
import { IoClose } from 'react-icons/io5'
import ProductDisplay from '../pages/ProductDisplay'

const ProductModal = ({ productId, onClose }) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-xs z-150 flex items-center justify-center p-4 md:p-10 transition-all duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-neutral-950 w-full max-w-6xl h-[90vh] md:h-[85vh] rounded-3xl overflow-hidden relative shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-200 bg-white/80 dark:bg-neutral-900/80 hover:bg-white dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white p-2 rounded-full border border-gray-250/20 shadow-md active:scale-95 transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <IoClose size={24} />
        </button>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <ProductDisplay productId={productId} onClose={onClose} />
        </div>
      </div>
    </div>
  )
}

export default ProductModal

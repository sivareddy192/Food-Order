import React, { useState, useEffect, useRef } from 'react'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import { createPortal } from 'react-dom'

const ProductAIChat = ({ product }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: 'ai', text: `Hi! I'm your Pickle AI assistant. Any questions about ${product.name}?` }
    ])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const chatEndRef = useRef(null)

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        if (isOpen) scrollToBottom()
    }, [messages, isOpen])

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!input.trim() || loading) return

        const userMessage = input.trim()
        setMessages(prev => [...prev, { role: 'user', text: userMessage }])
        setInput("")
        setLoading(true)

        try {
            const payload = {
                message: userMessage,
                productContext: {
                    name: product?.name || "Product",
                    category: product?.category?.[0]?.name || "General",
                    subCategory: product?.subCategory?.[0]?.name || "",
                    description: product?.description || "No description available",
                    unit: product?.unit || "N/A",
                    price: product?.price || 0,
                    discount: product?.discount || 0,
                    stock: product?.stock > 0 ? `In stock (${product.stock} units)` : "Out of stock",
                    more_details: product?.more_details
                        ? Object.entries(product.more_details)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(', ')
                        : ""
                }
            }

            const response = await Axios({
                ...SummaryApi.ai_chat,
                data: payload
            })

            if (response.data.success) {
                setMessages(prev => [...prev, { role: 'ai', text: response.data.data }])
            }
        } catch (error) {
            console.error("Chat Error:", error);
            const errorMessage = error?.response?.data?.message || "Something went wrong. Please check your login.";
            setMessages(prev => [...prev, { role: 'ai', text: `⚠️ ${errorMessage}` }]);
            AxiosToastError(error);
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='relative'>
            {/* The Chat Trigger (Icon Button) */}
            <button 
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(true);
                }}
                className='w-10 h-10 lg:w-12 lg:h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center shadow-sm hover:shadow-teal-100 hover:border-teal-200 transition-all group'
            >
                <div className='relative'>
                    <svg className='w-5 h-5 lg:w-6 lg:h-6 text-teal-600 group-hover:scale-110 transition-transform' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <span className='absolute -top-1 -right-1 w-2.5 h-2.5 bg-teal-500 rounded-full border-2 border-white animate-pulse'></span>
                </div>
            </button>

            {/* The Chat Modal (Using Portal to avoid parent clipping/transform issues) */}
            {isOpen && createPortal(
                <div 
                    className='fixed inset-0 z-9999 flex items-center justify-center p-4 lg:p-6'
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Backdrop */}
                    <div 
                        className='absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300'
                        onClick={() => setIsOpen(false)}
                    ></div>

                    {/* Modal Content */}
                    <div 
                        className='relative w-full max-w-xl bg-white rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col animate-in slide-in-from-bottom-12 duration-500 ease-out' 
                        style={{ height: '75vh', maxHeight: '650px' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        
                        {/* Premium Header */}
                        <div className='bg-linear-to-r from-teal-600 to-emerald-600 p-6 lg:p-8 flex items-center justify-between'>
                            <div className='flex items-center gap-4'>
                                <div className='w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner'>
                                    <svg className='w-7 h-7 text-white' fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM5.5 9.5a1 1 0 112 0 1 1 0 01-2 0zm7 1a1 1 0 100-2 1 1 0 000 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className='text-white font-black text-lg tracking-tight'>Pickle AI Assistant</h4>
                                    <div className='flex items-center gap-2'>
                                        <span className='w-2 h-2 bg-emerald-300 rounded-full animate-pulse'></span>
                                        <p className='text-[10px] text-teal-50 font-black uppercase tracking-widest'>Online & Ready</p>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)} 
                                className='w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all border border-white/10 text-white'
                            >
                                <svg className='w-6 h-6' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className='flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 bg-gray-50/50 scrollbar-thin scrollbar-thumb-teal-100 scrollbar-track-transparent'>
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] px-5 py-4 rounded-[28px] text-sm font-medium leading-relaxed shadow-sm
                                        ${msg.role === 'user' 
                                            ? 'bg-teal-600 text-white rounded-tr-lg' 
                                            : 'bg-white text-gray-700 border border-gray-100 rounded-tl-lg'}`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className='flex justify-start'>
                                    <div className='bg-white px-5 py-4 rounded-[28px] rounded-tl-lg border border-gray-100 shadow-sm flex gap-1.5 items-center'>
                                        <div className='w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce'></div>
                                        <div className='w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce delay-75'></div>
                                        <div className='w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce delay-150'></div>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Professional Input Area */}
                        <form onSubmit={handleSendMessage} className='p-6 bg-white border-t border-gray-100'>
                            <div className='relative flex items-center gap-3'>
                                <div className='flex-1 relative'>
                                    <input 
                                        type="text"
                                        placeholder="Ask anything about this product..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        className='w-full bg-gray-50 border-none rounded-3xl py-4 px-6 text-sm placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-teal-500/20 outline-none transition-all pr-12'
                                    />
                                    <div className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-300'>
                                        <svg className='w-5 h-5' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </div>
                                </div>
                                <button 
                                    type="submit"
                                    disabled={loading || !input.trim()}
                                    className='h-14 px-6 bg-teal-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-lg shadow-teal-600/20 disabled:bg-gray-200 disabled:shadow-none transition-all active:scale-95 flex items-center gap-2 hover:bg-teal-700'
                                >
                                    <span>Send</span>
                                    <svg className='w-4 h-4' fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}

export default ProductAIChat

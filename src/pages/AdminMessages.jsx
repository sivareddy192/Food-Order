import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaUser, FaCalendarAlt, FaTrash, FaTimes, FaInbox } from 'react-icons/fa';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';

const AdminMessages = () => {
    const [messages, setMessages] = useState([]);
    const [selectedMsg, setSelectedMsg] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchMessages = useCallback(async () => {
        try {
            const res = await Axios({
                ...SummaryApi.getContactMessages
            });
            if (res.data.success) {
                setMessages(res.data.data);
            }
        } catch (error) {
            console.error("Fetch messages error:", error);
            toast.error("Failed to load messages.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this message?")) return;

        try {
            const apiConfig = SummaryApi.deleteContactMessage(id);
            const res = await Axios({
                url: apiConfig.url,
                method: apiConfig.method
            });
            if (res.data.success) {
                setMessages(prev => prev.filter(msg => msg._id !== id));
                toast.success("Message deleted successfully");
                if (selectedMsg?._id === id) {
                    setSelectedMsg(null);
                }
            }
        } catch (error) {
            console.error("Delete message error:", error);
            toast.error("Failed to delete message.");
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + 
               date.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='p-6 lg:p-10 font-luxury-sans'
        >
            <div className='max-w-6xl mx-auto'>
                {/* Header */}
                <div className='flex items-center justify-between mb-8'>
                    <div>
                        <h1 className='text-2xl lg:text-3xl font-black text-gray-900 font-luxury-serif'>Contact Messages</h1>
                        <p className='text-xs text-gray-400 font-bold uppercase tracking-widest mt-1'>View and manage user contact inquiries</p>
                    </div>
                    <div className='bg-indigo-50 border border-indigo-150 text-indigo-700 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-3xs'>
                        {messages.length} {messages.length === 1 ? 'Message' : 'Messages'}
                    </div>
                </div>

                {/* Messages Grid */}
                {!loading && messages.length > 0 && (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <AnimatePresence>
                            {messages.map((msg) => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    key={msg._id}
                                    onClick={() => setSelectedMsg(msg)}
                                    className='bg-white rounded-3xl border border-gray-100 hover:border-gray-250 p-6 transition-all shadow-3xs hover:shadow-premium flex flex-col justify-between cursor-pointer group relative'
                                >
                                    <div>
                                        <div className='flex items-center justify-between gap-4 mb-4'>
                                            <div className='flex items-center gap-3'>
                                                <div className='w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold'>
                                                    <FaUser size={14} />
                                                </div>
                                                <div>
                                                    <h3 className='font-black text-gray-900 leading-snug text-[14.5px] group-hover:text-indigo-650 transition-colors'>{msg.name}</h3>
                                                    <p className='text-xs text-gray-400 font-semibold truncate max-w-[200px] sm:max-w-[280px]'>{msg.email}</p>
                                                </div>
                                            </div>
                                            <span className='text-[10px] font-bold text-gray-400 shrink-0'>{formatTime(msg.createdAt)}</span>
                                        </div>
                                        <p className='text-sm text-gray-600 font-medium line-clamp-3 leading-relaxed mb-4 whitespace-pre-wrap bg-gray-50/50 p-3.5 rounded-2xl border border-gray-100/70'>
                                            {msg.message}
                                        </p>
                                    </div>
                                    
                                    <div className='flex items-center justify-between mt-auto pt-2 border-t border-gray-50/50'>
                                        <span className='text-[10px] font-black text-indigo-600 uppercase tracking-widest group-hover:underline'>View Conversation</span>
                                        <button 
                                            onClick={(e) => handleDelete(e, msg._id)}
                                            className='p-2.5 bg-red-50 text-red-500 hover:bg-red-650 hover:text-white rounded-xl transition-all cursor-pointer'
                                        >
                                            <FaTrash size={12} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Empty State */}
                {messages.length === 0 && !loading && (
                    <div className='text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-150 shadow-3xs max-w-lg mx-auto mt-10'>
                        <div className='w-20 h-20 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-3xs'>
                            <FaInbox size={32} className='text-gray-300' />
                        </div>
                        <h2 className='text-lg font-black text-gray-800 mb-1 font-luxury-serif'>Inbox is empty</h2>
                        <p className='text-xs text-gray-400 font-bold uppercase tracking-widest max-w-xs mx-auto'>No customer inquiries received yet</p>
                    </div>
                )}
                
                {/* Loading skeleton */}
                {loading && (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className='h-48 bg-gray-50 rounded-3xl animate-pulse border border-gray-100' />
                        ))}
                    </div>
                )}
            </div>

            {/* Message Detail Modal */}
            <AnimatePresence>
                {selectedMsg && (
                    <div className='fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs'>
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className='bg-white rounded-[2rem] w-full max-w-xl overflow-hidden shadow-2xl border border-gray-100'
                        >
                            <div className='p-8'>
                                <div className='flex justify-between items-start mb-6'>
                                    <div className='flex items-center gap-3.5'>
                                        <div className='w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shadow-3xs'>
                                            <FaEnvelope />
                                        </div>
                                        <div>
                                            <h2 className='text-xl font-black text-gray-900 leading-tight'>{selectedMsg.name}</h2>
                                            <p className='text-xs text-gray-400 font-bold mt-0.5'>{selectedMsg.email}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedMsg(null)}
                                        className='p-2.5 hover:bg-gray-100 rounded-xl transition-all cursor-pointer border border-gray-100 shadow-3xs active:scale-95'
                                    >
                                        <FaTimes className='text-gray-400' />
                                    </button>
                                </div>
                                
                                <div className='flex items-center gap-1.5 mb-6 text-[10px] font-black text-indigo-600 uppercase tracking-widest'>
                                    <FaCalendarAlt />
                                    <span>Received: {formatTime(selectedMsg.createdAt)}</span>
                                </div>
                                
                                <div className='bg-gray-50 rounded-2xl p-6 border border-gray-100 max-h-[300px] overflow-y-auto no-scrollbar'>
                                    <p className='text-gray-700 leading-relaxed font-semibold text-sm whitespace-pre-wrap'>
                                        {selectedMsg.message}
                                    </p>
                                </div>

                                <div className='flex items-center gap-3 mt-8'>
                                    <a 
                                        href={`mailto:${selectedMsg.email}`}
                                        className='flex-1 bg-indigo-600 text-white font-black uppercase tracking-widest text-[11px] py-4 rounded-xl hover:bg-indigo-750 transition-all active:scale-[0.98] text-center shadow-lg shadow-indigo-100'
                                    >
                                        Reply via Email
                                    </a>
                                    <button 
                                        onClick={(e) => handleDelete(e, selectedMsg._id)}
                                        className='px-5 bg-red-50 text-red-500 hover:bg-red-650 hover:text-white rounded-xl transition-all py-4 font-black uppercase tracking-widest text-[11px] active:scale-[0.98] cursor-pointer'
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AdminMessages;

/*completed */
import React, { useState } from 'react'
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa6";
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { Link, useNavigate } from 'react-router-dom';
import fetchUserDetails from '../utils/fetchUserDetails';
import { useDispatch } from 'react-redux';
import { setUserDetails } from '../store/userSlice';
import Pickle3DScene from '../components/Pickle3DScene';
import CloudflareTurnstile from '../components/CloudflareTurnstile';

const Login = () => {
  const [data, setData] = useState({
    email: "",
    password: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [cfVerified, setCfVerified] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleChange = (e) => {
    const { name, value } = e.target

    setData((preve) => ({
      ...preve,
      [name]: value
    }))

    // Password strength validation
    if (name === "password") {
      if (value.length < 8) {
        setPasswordError("Password must be at least 8 characters long.")
      } else if (!/^[A-Z]/.test(value)) {
        setPasswordError("Password must start with an uppercase letter.")
      } else if (!/[0-9]/.test(value)) {
        setPasswordError("Password must contain at least one number.")
      } else if (!/[!@#$%^&*]/.test(value)) {
        setPasswordError("Password must contain at least one special character (!@#$%^&*).")
      } else {
        setPasswordError("")
      }
    }
  }

  const valideValue = Object.values(data).every(el => el) && acceptedTerms && cfVerified

  const handleSubmit = async(e)=>{
        e.preventDefault()
        if (passwordError) {
          toast.error("Please enter a strong password before Login.")
          return
        }

        try {
            const response = await Axios({
                ...SummaryApi.login,
                data : data
            })
            
            if(response.data.error){
                toast.error(response.data.message)
            }

            if(response.data.success){
                toast.success(response.data.message)
                localStorage.setItem('accessToken',response.data.data.accessToken)
                localStorage.setItem('refreshToken',response.data.data.refreshToken)

                
                const userDetails = await fetchUserDetails()
                dispatch(setUserDetails(userDetails.data))

                setData({
                    email : "",
                    password : "",
                })

                // Role-based redirection
                if (userDetails.data.role === "ADMIN") {
                    navigate("/dashboard/Admin-Orders")
                } else if (userDetails.data.role === "DELIVERY_BOY") {
                    navigate("/dashboard/delivery-boy")
                } else {
                    navigate("/")
                }
            }

        } catch (error) {
            AxiosToastError(error)
        }



    }
  return (
    <section className='w-full min-h-[85vh] flex items-center justify-center p-4 md:p-8'>
      <div className='glass-card w-full max-w-5xl mx-auto rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[600px]'>
        
        {/* Left Side - 3D Vision Scene */}
        <div className='hidden md:block w-1/2 relative bg-[#082215]'>
            <Pickle3DScene />
        </div>

        {/* Right Side - Login Form */}
        <div className='w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center'>
          <p className='text-gray-950 dark:text-white font-black text-3xl tracking-tight mb-2 font-luxury-serif uppercase'>Welcome to Pickle</p>
          <p className='text-xs text-gray-500 dark:text-gray-400 font-medium mb-8 font-luxury-sans'>Please sign in to access your exclusive account.</p>

          <form className='grid gap-5' onSubmit={handleSubmit}>

          {/* Email Field */}
          <div className='grid gap-1.5'>
            <label htmlFor='email' className='text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest'>Email</label>
            <input
                type='email'
                id='email'
                className='bg-gray-50 dark:bg-[#0c0d12] p-3.5 border border-gray-100 dark:border-luxury-border rounded-2xl outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 dark:focus:border-green-500 text-gray-900 dark:text-neutral-100 transition-all font-semibold'
                name='email'
                value={data.email}
                onChange={handleChange}
                placeholder='Enter your email'
            />
          </div>

          {/* Password Field */}
          <div className='grid gap-1.5'>
            <label htmlFor='password' className='text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest'>Password</label>
            <div className='bg-gray-50 dark:bg-[#0c0d12] p-3.5 border border-gray-100 dark:border-luxury-border rounded-2xl flex items-center focus-within:ring-2 focus-within:ring-green-500/20 focus-within:border-green-400 dark:focus-within:border-green-500 transition-all'>
              <input
                type={showPassword ? "text" : "password"}
                id='password'
                name='password'
                className='w-full outline-none bg-transparent text-gray-900 dark:text-neutral-100 font-semibold'
                value={data.password}
                onChange={handleChange}
                placeholder='Enter your password'
              />
              <div onClick={() => setShowPassword(preve => !preve)} className='cursor-pointer text-gray-400 dark:text-gray-500 pl-2'>
                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </div>
            </div>

            {/* Password strength feedback */}
            {passwordError ? (
              <p className='text-red-500 text-xs font-bold mt-1'>{passwordError}</p>
            ) : (
              data.password && <p className='text-green-500 text-xs font-bold mt-1'>Strong password</p>
            )}

            <Link to={"/forgot-password"} className='block ml-auto text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider hover:text-green-500 dark:hover:text-emerald-400 transition-colors mt-1'>
              Forgot password ?
            </Link>
          </div>

          {/* Terms & Conditions Checkbox */}
          <div className='flex items-center space-x-2.5 mt-1'>
            <input
              type='checkbox'
              id='acceptedTerms'
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className='w-4.5 h-4.5 rounded border-gray-300 dark:border-luxury-border text-[#0A845C] focus:ring-[#0A845C]/20 accent-[#0A845C] cursor-pointer'
            />
            <label htmlFor='acceptedTerms' className='text-xs font-semibold text-gray-500 dark:text-gray-400 cursor-pointer select-none'>
              I agree to the <Link to="/terms" className="text-[#0A845C] hover:underline dark:text-emerald-400 font-bold">Terms & Conditions</Link>
            </label>
          </div>

          {/* Cloudflare Turnstile Widget */}
          <div className='flex justify-start my-1.5'>
            <CloudflareTurnstile onVerify={setCfVerified} />
          </div>

          <button
            disabled={!valideValue}
            className={`${valideValue ? "bg-[#0A845C] hover:bg-[#076848] text-white shadow-lg shadow-green-500/10 cursor-pointer" : "bg-gray-100 dark:bg-neutral-800 text-gray-400 dark:text-neutral-600 cursor-not-allowed"} py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest my-3 transition-all active:scale-95`}>
            Login
          </button>
        </form>

        <p className='text-sm text-gray-500 dark:text-gray-400 font-medium text-center mt-4'>
          Don't have account?{" "}
          <Link to={"/register"} className='font-black text-[#0A845C] hover:text-[#076848] dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors'>
            Register
          </Link>
        </p>
        </div>
      </div>
    </section>
  )
}

export default Login

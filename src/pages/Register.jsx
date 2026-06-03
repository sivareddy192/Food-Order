import React, { useState } from 'react'
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa6";
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { Link, useNavigate } from 'react-router-dom';
import Pickle3DScene from '../components/Pickle3DScene';

const Register = () => {

  const globalStyle = `
    @keyframes pulseStrong {
      0% { transform: scale(1); }
      50% { transform: scale(1.07); }
      100% { transform: scale(1); }
    }

    @keyframes glowStrong {
      0% { box-shadow: 0 0 4px rgba(0,255,0,0.3); }
      50% { box-shadow: 0 0 12px rgba(0,255,0,0.8); }
      100% { box-shadow: 0 0 4px rgba(0,255,0,0.3); }
    }
  `;

  const [data, setData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [passwordError, setPasswordError] = useState("")
  const [confirmError, setConfirmError] = useState("")
  const [strength, setStrength] = useState(0)

  const navigate = useNavigate()

  // Calculate password strength score
  const calculateStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score += 25;
    if (/^[A-Z]/.test(pwd)) score += 25;
    if (/[0-9]/.test(pwd)) score += 25;
    if (/[!@#$%^&*]/.test(pwd)) score += 25;
    return score;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Password validation
    if (name === "password") {
      setStrength(calculateStrength(value));

      if (!value) {
        setPasswordError("Password cannot be empty.");
      }
      else if (!/^[A-Z]/.test(value)) {
        setPasswordError("First letter must be uppercase.");
      }
      else if (!/[0-9]/.test(value)) {
        setPasswordError("Password must contain at least one number.");
      }
      else if (!/[!@#$%^&*]/.test(value)) {
        setPasswordError("Password must contain at least one special character.");
      }
      else if (value.length < 8) {
        setPasswordError("Password must be at least 8 characters long.");
      }
      else {
        setPasswordError("");
      }

      // Live confirm password check
      if (data.confirmPassword) {
        if (value === data.confirmPassword) {
          setConfirmError("Passwords match");
        } else {
          setConfirmError("Passwords do not match");
        }
      }
    }

    if (name === "confirmPassword") {
      if (!value) {
        setConfirmError("");
      }
      else if (value !== data.password) {
        setConfirmError("Passwords do not match");
      }
      else {
        setConfirmError("Passwords match");
      }
    }
  };

  const isStrongPassword = strength === 100 && !passwordError;
  const valideValue = Object.values(data).every(el => el)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isStrongPassword) {
      toast.error("Password is not strong enough!");
      return;
    }

    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await Axios({
        ...SummaryApi.register,
        data: data
      })

      if (response.data.error) {
        toast.error(response.data.message)
      }

      if (response.data.success) {
        toast.success("Verification mail sent to your mail", { duration: 5000 })
        setData({
          name: "",
          email: "",
          password: "",
          confirmPassword: ""
        })
        navigate("/login")
      }

    } catch (error) {
      AxiosToastError(error)
    }
  }

  return (
    <section className='w-full min-h-[85vh] flex items-center justify-center p-4 md:p-8'>
      
      <style>{globalStyle}</style>

      <div className='glass-card w-full max-w-5xl mx-auto rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[600px]'>
        
        {/* Left Side - 3D Vision Scene */}
        <div className='hidden md:block w-1/2 relative bg-[#082215]'>
            <Pickle3DScene />
        </div>

        {/* Right Side - Register Form */}
        <div className='w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center'>
          <p className='text-gray-950 dark:text-white font-black text-3xl tracking-tight mb-2 font-luxury-serif uppercase'>Welcome to Pickle</p>
          <p className='text-xs text-gray-500 dark:text-gray-400 font-medium mb-6 font-luxury-sans'>Join us and experience the premium luxury grocery portal.</p>

          <form className='grid gap-4 mt-6' onSubmit={handleSubmit}>
          
          {/* Name */}
          <div className='grid gap-1.5'>
            <label htmlFor='name' className='text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest'>Name</label>
            <input
              type='text'
              id='name'
              name='name'
              autoComplete='name'              
              className='bg-gray-50 dark:bg-[#0c0d12] p-3.5 border border-gray-100 dark:border-luxury-border rounded-2xl outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 dark:focus:border-green-500 text-gray-900 dark:text-neutral-100 transition-all font-semibold'
              value={data.name}
              onChange={handleChange}
              placeholder='Enter your name'
              autoFocus
            />
          </div>

          {/* Mobile Number */}
          <div className='grid gap-1.5'>
            <label htmlFor='mobile' className='text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest'>Mobile Number</label>
            <input
              type='tel'
              id='mobile'
              name='mobile'
              autoComplete='tel'              
              className='bg-gray-50 dark:bg-[#0c0d12] p-3.5 border border-gray-100 dark:border-luxury-border rounded-2xl outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 dark:focus:border-green-500 text-gray-900 dark:text-neutral-100 transition-all font-semibold'
              value={data.mobile}
              onChange={handleChange}
              placeholder='Enter your mobile number'
            />
          </div>

          {/* Email */}
          <div className='grid gap-1.5'>
            <label htmlFor='email' className='text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest'>Email</label>
            <input
              type='email'
              id='email'
              name='email'
              autoComplete='email'              
              className='bg-gray-50 dark:bg-[#0c0d12] p-3.5 border border-gray-100 dark:border-luxury-border rounded-2xl outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 dark:focus:border-green-500 text-gray-900 dark:text-neutral-100 transition-all font-semibold'
              value={data.email}
              onChange={handleChange}
              placeholder='Enter your email'
            />
          </div>

          {/* Password */}
          <div className='grid gap-1.5'>
            <label htmlFor='password' className='text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest'>Password</label>

            <div
              className={`bg-gray-50 dark:bg-[#0c0d12] p-3.5 border border-gray-100 dark:border-luxury-border rounded-2xl flex items-center transition-all 
                ${isStrongPassword ? "border-green-500 dark:border-green-500 animate-[glowStrong_1s_ease-in-out_infinite]" : "focus-within:ring-2 focus-within:ring-green-500/20 focus-within:border-green-400 dark:focus-within:border-green-500"}`}
            >
              <input
                type={showPassword ? "text" : "password"}
                id='password'
                name='password'
                autoComplete='new-password'     
                className='w-full outline-none bg-transparent text-gray-900 dark:text-neutral-100 font-semibold'
                value={data.password}
                onChange={handleChange}
                placeholder='Enter your password'
              />
              <div onClick={() => setShowPassword(prev => !prev)} className='cursor-pointer text-gray-400 dark:text-gray-500 pl-2'>
                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </div>
            </div>

            {/* Strength bar */}
            {data.password && (
              <div className="w-full h-1.5 bg-gray-250 dark:bg-neutral-800 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${strength}%`,
                    background:
                      strength < 50 ? "#ef4444" :
                        strength < 75 ? "#f97316" :
                          "#10b981",
                    animation: strength === 100 ? "pulseStrong 0.7s ease-out" : "none"
                  }}
                ></div>
              </div>
            )}

            {/* Error / success message */}
            {passwordError ? (
              <p className='text-red-500 text-xs font-bold mt-1'>{passwordError}</p>
            ) : (
              data.password && <p className='text-green-500 text-xs font-bold mt-1'>Strong password</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className='grid gap-1.5'>
            <label htmlFor='confirmPassword' className='text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest'>Confirm Password</label>

            <div className='bg-gray-50 dark:bg-[#0c0d12] p-3.5 border border-gray-100 dark:border-luxury-border rounded-2xl flex items-center focus-within:ring-2 focus-within:ring-green-500/20 focus-within:border-green-400 dark:focus-within:border-green-500 transition-all'>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id='confirmPassword'
                name='confirmPassword'
                autoComplete='new-password'       
                className='w-full outline-none bg-transparent text-gray-900 dark:text-neutral-100 font-semibold'
                value={data.confirmPassword}
                onChange={handleChange}
                placeholder='Enter confirm password'
              />
              <div onClick={() => setShowConfirmPassword(prev => !prev)} className='cursor-pointer text-gray-400 dark:text-gray-500 pl-2'>
                {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </div>
            </div>

            {confirmError && (
              <p className={`${confirmError.includes("match") ? "text-green-500" : "text-red-500"} text-xs font-bold mt-1`}>
                {confirmError}
              </p>
            )}
          </div>

          <button
            disabled={!valideValue || !isStrongPassword}
            className={`${valideValue && isStrongPassword
              ? "bg-[#0A845C] hover:bg-[#076848] text-white shadow-lg shadow-green-500/10 cursor-pointer"
              : "bg-gray-100 dark:bg-neutral-800 text-gray-400 dark:text-neutral-600 cursor-not-allowed"} py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest my-3 transition-all active:scale-95`}>
            Register
          </button>
        </form>

        <p className='text-sm text-gray-500 dark:text-gray-400 font-medium text-center mt-4'>
          Already have account?{" "}
          <Link to={"/login"} className='font-black text-[#0A845C] hover:text-[#076848] dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors'>
            Login
          </Link>
        </p>
        </div>
      </div>
    </section>
  )
}

export default Register;

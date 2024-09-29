import  { useState } from 'react';
import { FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="w-full max-w-md p-8 space-y-6   bg-white border border-black-2 rounded-md">
        <h2 className="text-2xl font-bold text-center">Login</h2>
        <form className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            <input
              type="email"
              required
              placeholder="Email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Password"
                className="w-full mt-35 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <FaEyeSlash className="text-gray-500" />
                ) : (
                  <FaEye className="text-gray-500" />
                )}
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
          >
            Login
          </button>
          <button
            type="button"
            className="flex items-center justify-center w-full px-4 py-2 mt-2 font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
          >
            <FaGoogle className="mr-2" />
            Login with Google
          </button>
        </form>
        <p className="text-center text-sm text-gray-600">
          Don&#39;t have an account?{' '}
          <a href="/signup" className="text-blue-500 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;

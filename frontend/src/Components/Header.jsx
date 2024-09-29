import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

// import { CgProfile } from "react-icons/cg";
//  import './Components/index.css';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { loginWithRedirect,  user, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  // if (isLoading) {
  //   return <div>Loading ...</div>;
  // }
  console.log(user);
  const handleProfileNavigation = () => {
    if (user && user.nickname) {
      // Navigate to the profile page with the username in the route
      navigate(`/${user.nickname}`);
    }
  };

  return (
    <nav className=" fixed top-0 left-0 z-50 w-full bg-gray-700  ">
      <div className="relative container p-2 mx-auto flex lg:justify-between justify-center text-center ">
        <div className="text-white text-2xl font-bold pt-1">
          <Link to="/" className="" onClick={() => setIsOpen(false)}>
            <strong>S</strong>AFAR
          </Link>
        </div>
        <div className=" lg:hidden">
          {isAuthenticated ? (
            <div
              className="bg-red-500  hover:bg-red-300 absolute right-3 rounded-3xl text-white"
              onClick={handleProfileNavigation}
            >
              <img
                className="w-9 h-9  rounded-full object-cover"
                src={user.picture}
                alt={user.name}
              />
            </div>
          ) : (
            <button
              onClick={() => loginWithRedirect()}
              className="bg-red-500 p-1 rounded hover:bg-red-300 absolute right-3  text-white"
            >
              Login
            </button>
          )}
          {/* <CgProfile className='text-3xl ' /> */}
          {/* <button className='bg-red-500 p-1 rounded hover:bg-red-300 absolute right-3  text-white'>Login</button> */}
        </div>
        <div className="md:hidden pt-1 absolute left-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white focus:outline-none"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns=""
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              ></path>
            </svg>
          </button>
        </div>
        <div
          className={`${
            isOpen ? "block" : "hidden"
          } absolute z-50 top-0 left-0 w-full rounded-lg animate-slide-down h-screen  bg-gray-700 opacity-100  md:h-auto md:w-auto md:static md:flex md:items-center transition-transform duration-300 ease-in-out`}
        >
          <div className="flex justify-between items-center px-4 py-2 md:hidden">
            <div className="text-white text-2xl font-bold  ">
              <Link to="/" onClick={() => setIsOpen(false)}>
                <strong>S</strong>AFAR
              </Link>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-white focus:outline-none"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
          <ul className="text-white space-y-6 md:space-y-0 md:flex md:space-x-9 text-center md:h-full md:items-center">
            <li className="hover:text-sky-200 text-2xl lg:text-lg border-b-2 border-gray-300 sm:border-transparent">
              <Link className="" to="/about" onClick={() => setIsOpen(false)}>
                About
              </Link>
            </li>

            <li className="hover:text-sky-200 text-2xl lg:text-lg border-b-2 border-gray-300 sm:border-transparent">
              <Link to="/contact" onClick={() => setIsOpen(false)}>
                Contact Us
              </Link>
            </li>
            <li className="hover:text-sky-200 cursor-pointer text-2xl lg:text-lg border-b-2 border-gray-300 sm:border-transparent">
              <Link to="/driver" onClick={() => setIsOpen(false)}>
                Driver
              </Link>
            </li>
            <li className="hover:text-sky-200 cursor-pointer text-2xl lg:text-lg  border-b-2 border-gray-300 sm:border-transparent">
              <Link to="/rider" onClick={() => setIsOpen(false)}>
                Rider
              </Link>
            </li>
           
            {isAuthenticated ? (
             <li  onClick={() => setIsOpen(false)} className="hidden lg:block">
               <div
               className="  cursor-pointer hover:bg-gray-400 rounded-xl"
               onClick={handleProfileNavigation}
             >
               <img
                 className="w-9 h-9  rounded-full object-cover"
                 src={user.picture}
                 alt={user.name}
               />
             </div>
             </li>
             
            ) : (
              <li className="hidden lg:block cursor-pointer px-4 py-2 w-full md:w-auto">
                <Link to="" onClick={() => setIsOpen(false)}>
                  <button
                    onClick={() => loginWithRedirect()}
                    className=" text-black px-2 py-1 rounded w-full md:w-auto bg-red-500 hover:bg-red-300"
                  >
                    Login
                  </button>
                  {/* <CgProfile className='text-3xl ' /> */}
                  {/* <button className='bg-red-500 p-1 rounded hover:bg-red-300 absolute right-3  text-white'>Login</button> */}
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;

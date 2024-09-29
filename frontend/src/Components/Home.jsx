import { useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";



const Home = () => {
  // const driver="Driver";
  // const rider="Rider";
  const {  user, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen  p-4 pb-8 pt-15 ">
      {
        isAuthenticated &&
        <div >
          <h1 className='text-3xl font-extrabold' >Welcome, <span>{user.nickname}</span></h1>
        </div>
      }
      <div className="container w-30 mx-auto md:align-middle  md:flex-row ">
        {/* Driver */}
        <div className="mt-20 flex-1 shadow-lg rounded overflow-hidden flex justify-center items-center bg-gray-200 text-black h-auto w-25">
          <img src='car.png' alt="Driver" className="w-24 h-24 object-cover" />
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-2 ">For Driver</h1>
            <p className="mb-4">Become a part of our driving community. Offer rides and earn money while helping people get to their destinations.</p>
           <hr className='bg-black'/>
            <button onClick={() => navigate('/driver')} className="mt-5 bg-pink-700 text-white py-2 px-4 rounded-3xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
              Start 
            </button>
          </div>
        </div>
        
        {/* Rider */}
        <div className="mt-20 flex-1 shadow-lg rounded overflow-hidden flex justify-center items-center bg-gray-200 text-black h-auto w-25">
          <img src="rider.png" alt="Rider" className="w-24 h-24 object-cover" />
          <div className="p-6">
            <h1 className="text-2xl  font-semibold mb-2">For Rider</h1>
            <p className=" mb-4">Find rides quickly and easily. Connect with drivers near you and enjoy a comfortable journey to your destination.</p>
            <hr className='bg-black' />
            <button onClick={() => navigate('/rider')} className="mt-5 bg-pink-700 text-white py-2 px-4 rounded-3xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
              Start 
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

 
import { useAuth0 } from "@auth0/auth0-react";
import {  useNavigate } from 'react-router-dom';

const Profile = () => {
  const { logout, user, isAuthenticated } = useAuth0();
  // const { username } = useParams();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    // Redirect to the home page if not authenticated
    navigate('/');
    return null;
  }

  return (
    <div className="container mx-auto p-4 h-screen">
      

      <div className="bg-gray-100 p-4 rounded shadow-md">
        <div >
        <img src={user.picture} alt={user.name} className="w-24 h-24 rounded-full mb-4 justify-center" />
        
        </div>
       <hr className="bg-black" />
       <h2 className="text-xl font-bold">{user.nickname}</h2>
        <p className="text-xl text-gray-600">Email: {user.email}</p>
         {/* <p className="text-sm text-gray-600">Nickname: {user.username}</p>  */}
        <button
        onClick={() => logout({ returnTo: window.location.origin })}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-300 "
      >
        Log Out
      </button>
      </div>

     
    </div>
  );
};

export default Profile;

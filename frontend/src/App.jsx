import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./Components/Header";
import DriverList from "./Components/DriverList";
import Footer from "./Components/Footer";
import Rider from "./Components/Rider";
import Profile from "./Components/Profile";
import Login from "./Components/Login";
import SignUp from "./Components/SignUp";
import DriverForm from "./Components/DriverForm";
import Home from "./Components/Home";
import Driver from "./Components/Driver";
import Practice from "./Components/Practice";
import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Loader from "./Components/Loader";
import Start from "./Components/Start";

function App() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const { isAuthenticated } = useAuth0();

  return loading ? (
    <Loader />
  ) : isAuthenticated ? (
    <div>
      <div className="flex-col min-h-100 gap-1">
        <Router>
          <Header />

          {/* <Map/> */}
          <div className="flex-grow mt-[47px] ">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/:nickname" element={<Profile />} />
              <Route path="/driverform" element={<DriverForm />} />
              <Route path="/rider" element={<Rider />} />
              <Route path="/driver" element={<Driver />} />
              <Route path="/driverlist" element={<DriverList />} />
            </Routes>
          </div>
          <Footer />
        </Router>
      </div>
    </div>
  ) : (
    <Start />
    
  );
}

export default App;

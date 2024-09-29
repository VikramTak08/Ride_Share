/* eslint-disable no-unused-vars */
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import simplify from 'simplify-js';
import { useState } from "react";
import axios from "axios";

const DriverForm = () => {
const location= useLocation();
const navigate = useNavigate();
const {startLocation,destinationLocation,waypoints}=location.state||{};

console.log("startLocation :", startLocation);
console.log("destinationLocation :", destinationLocation);
console.log("waypoints :", waypoints);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [seats, setSeats] = useState(1);
  const [vehicle, setVehicle] = useState("Bike");
  const [fare, setFare] = useState('');





  // const [driver, setDriver] = useState({
  //   startLocation: "",
  //   destinationLocation: "",
  //   name: "",
  //   phone: "",
  //   vehicle: "",
  //   seats: "",
  //   fare: "",
  //   waypoints: "",
  // });
  // const handleChange = (e) => {
  //   // console.log(e);
  //   let  name= e.target.name;
  //   let value =e.target.value;
  //   setDriver({
  //     ...driver,
  //     [name]:value,
  //   })
  // };
 
  const handleSubmit = async (e) => {

    e.preventDefault();
    // Convert waypoints to a format `simplify-js` expects
const points = waypoints.map(coord => ({ x: coord[0], y: coord[1] }));

// Simplify points (tolerance 0.0001 can be adjusted based on precision needed)
const simplifiedPoints = simplify(points, 0.00005);

// Convert back to coordinates array format
const simplifiedWaypoints = simplifiedPoints.map(point => [point.x, point.y]);
    
    const driverData = {
      name,
      phone,
      seats,
      vehicle,
      fare,
      startLocation,
      destinationLocation,
      waypoints: {
        type: "LineString", // Fix type here to match the schema
        coordinates: simplifiedWaypoints.map(([lat, lng]) => [lng, lat]), // Array of coordinates in GeoJSON format
      },
    };
   
    try {
         
         
          const response= fetch(`http://localhost:5000/save-driver`, {
            method:"POST",
            headers:{
              "Content-Type": "application/json",
            },
            body: JSON.stringify(driverData),
          })
          console.log(response);
          alert("Driver data saved successfully!");
           // Navigate to home page or another page after submission
      navigate("/");
        }
         catch (error) {
          console.error("There was an error saving the data!", error);
        }
    };

  
  
  

  return (
    <div className=" min-h-screen p-1 bg-gray-200   ">
      <div className="container bg-white  mx-auto lg:w-[60%] gap-1 mt-22 mb-10   ">
        <div className="col-span-1  shadow-md rounded-lg p-6  ">
          <h1 className="text-2xl  font-semibold mb-4">Driver Info Form</h1>

          <form onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="startLocation"
                className="block text-xl font-medium "
              >
                Starting Location :
              </label>
              <input
                 required
                 readOnly
                type="text"
                id="startLocation"
                name="startLocation"
                value={startLocation}
               
                // className="mt-1 block w-full h-8 text-xl pl-3 text-black border-gray-300 border-b-2 focus:outline-none focus:ring-0   shadow-sm"
              className="border bg-gray-200 border-gray-200 rounded-lg p-2 mt-1 w-full text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label
                htmlFor="destinationLocation"
                className="block text-xl font-medium "
              >
                Destination Location :
              </label>
              <input
              required
              readOnly
                type="text"
                id="destinationLocation"
                name="destinationLocation"
                value={destinationLocation}
                
                className="border bg-gray-200 border-gray-200 rounded-lg p-2 mt-1 w-full text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label
                htmlFor="name"
                className="block text-xl font-medium "
              >
                Name :
              </label>
              <input
              required
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border bg-gray-200 border-gray-200 rounded-lg p-2 mt-1 w-full text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label
                htmlFor="fare"
                className="block text-xl font-medium "
              >
                Phone No :
              </label>
              <input
              required
                type="number"
                id="phone"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border bg-gray-200 border-gray-200 rounded-lg p-2 mt-1 w-full text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label
                htmlFor="vehicleType"
                className="block text-xl font-medium "
              >
                Vehicle Type :
              </label>
              <input
              required
              placeholder="type Car,Bike,Bus etc."
                id="vehicleType"
                name="vehicle"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                className="border bg-gray-200 border-gray-200 rounded-lg p-2 mt-1 w-full text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
               
            </div>

            <div>
              <label
                htmlFor="numberOfSeats"
                className="block text-xl font-medium "
              >
                Number of Seats :
              </label>
              <input
              required
                type="number"
                id="numberOfSeats"
                name="seats"
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                className="border bg-gray-200 border-gray-200 rounded-lg p-2 mt-1 w-full text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label
                htmlFor="fare"
                className="block text-xl font-medium "
              >
                Fare :
              </label>
              <input
              required
                type="number"
                id="fare"
                name="fare"
                value={fare}
                onChange={(e) => setFare(e.target.value)}
                className="border bg-gray-200 border-gray-200 rounded-lg p-2 mt-1 w-full text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="flex gap-4 mt-4">
              <button
                 onClick={() => {handleSubmit}}
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Save
              </button>

              <button
                type="button"
                onClick={() => navigate("/map")} // Redirect to home page
                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}



export default DriverForm;

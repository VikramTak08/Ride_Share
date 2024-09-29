import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const RiderComponent = () => {
  const [pickupLocation, setPickupLocation] = useState("");
  const [destinationLocation, setDestinationLocation] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [driverList, setDriverList] = useState([]);
  const [map, setMap] = useState(null);
  const [routingControl, setRoutingControl] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null); // To track selected driver
console.log(selectedDriver);
  // Geocode function to get coordinates by address using Nominatim API
  const getCoordinates = async (address) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${address}&format=json&limit=1`
    );
    const data = await response.json();
    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      return [parseFloat(lat), parseFloat(lon)];
    } else {
      console.error("No coordinates found for the address:", address);
      return null;
    }
  };

  const handleSave = async () => {
    const pickupCoords = await getCoordinates(pickupLocation);
    const destinationCoords = await getCoordinates(destinationLocation);

    if (pickupCoords && destinationCoords) {
      setPickupCoords(pickupCoords);
      setDestinationCoords(destinationCoords);

      const riderData = {
        pickupCoords: [pickupCoords[1], pickupCoords[0]],
        destinationCoords: [destinationCoords[1], destinationCoords[0]],
      };

      try {
        const response = await fetch("http://localhost:5000/match-drivers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(riderData),
        });

        if (response.ok) {
          const data = await response.json();
          setDriverList(data.drivers);
        } else {
          console.error("Failed to find drivers");
        }
      } catch (error) {
        console.error("Error finding drivers:", error);
      }
    }
  };

  const handleDriverClick = (driver) => {
    // You can handle any action when the driver is clicked here
    setSelectedDriver(driver); // Set the selected driver
    console.log("Driver clicked:", driver);

    // Optionally, you can zoom to the driver's route on the map or highlight it
    const driverPickupCoords = [
      driver.waypoints.coordinates[0][1],
      driver.waypoints.coordinates[0][0],
    ];
    const driverDestinationCoords = [
      driver.waypoints.coordinates[1][1],
      driver.waypoints.coordinates[1][0],
    ];

    if (map) {
      map.setView(driverPickupCoords,driverDestinationCoords, 15); // Zoom to driver's pickup location
    }
  };

  useEffect(() => {
    if (map && driverList.length > 0) {
      // Clear the existing routing control if it exists
      if (routingControl) {
        routingControl.setWaypoints([]);
        routingControl.remove();
      }

      const waypoints = driverList.map((driver) => {
        const driverPickupCoords = [
          driver.waypoints.coordinates[0][1],
          driver.waypoints.coordinates[0][0],
        ];
        const driverDestinationCoords = [
          driver.waypoints.coordinates[1][1],
          driver.waypoints.coordinates[1][0],
        ];
        return [L.latLng(driverPickupCoords), L.latLng(driverDestinationCoords)];
      });

      // Add new routing control
      const newRoutingControl = L.Routing.control({
        waypoints: waypoints.flat(),
        routeWhileDragging: true,
        lineOptions: {
          styles: [{ color: "black", opacity: 0.8, weight: 6 }],
        },
      }).addTo(map);

      setRoutingControl(newRoutingControl);
    }

    // Clean up function to remove routing control when component unmounts or driverList changes
    return () => {
      if (routingControl) {
        routingControl.remove();
      }
    };
  }, [map, driverList, routingControl]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Rider Component</h1>

      {/* Input form */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Pickup Location"
          value={pickupLocation}
          onChange={(e) => setPickupLocation(e.target.value)}
          className="border border-gray-300 p-2 rounded mr-2 w-1/2"
        />
        <input
          type="text"
          placeholder="Destination Location"
          value={destinationLocation}
          onChange={(e) => setDestinationLocation(e.target.value)}
          className="border border-gray-300 p-2 rounded w-1/2"
        />
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white p-2 rounded mt-4 w-full"
        >
          Save
        </button>
      </div>

      {/* Map Section */}
      <div className="h-96 mb-6">
        <MapContainer
          center={[23.213, 77.404]}
          zoom={15}
          whenCreated={setMap}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {pickupCoords && <Marker position={pickupCoords}></Marker>}
          {destinationCoords && <Marker position={destinationCoords}></Marker>}
        </MapContainer>
      </div>

      {/* Driver List Display */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Available Drivers</h2>
        <div className="space-y-4">
          {driverList.length > 0 ? (
            driverList.map((driver, index) => (
              <div
                key={index}
                className="border border-gray-300 bg-white p-4 rounded shadow flex justify-between items-center hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                onClick={() => handleDriverClick(driver)}
              >
                <div>
                  <p className="font-bold">{driver.name}</p>
                  <p>Vehicle: {driver.vehicle}</p>
                  <p>Seats: {driver.seats}</p>
                  <p>Fare: ${driver.fare}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No drivers found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiderComponent;





// import  { useState } from "react";
// import { MapContainer, TileLayer, Marker } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
// import "leaflet-control-geocoder/dist/Control.Geocoder.css";
// import "leaflet-routing-machine";
// import L from "leaflet";

// const RiderComponent = () => {
//   const [pickupLocation, setPickupLocation] = useState("");
//   const [destinationLocation, setDestinationLocation] = useState("");
//   const [pickupCoords, setPickupCoords] = useState(null);
//   const [destinationCoords, setDestinationCoords] = useState(null);
//   const [driverList, setDriverList] = useState([]);
//   const [map, setMap] = useState(null);
//   const [routingControl, setRoutingControl] = useState(null);
//   // const [selectedDriverRoute, setSelectedDriverRoute] = useState(null);

//   // Geocode function to get coordinates by address using Nominatim API
//   const getCoordinates = async (address) => {
//     const response = await fetch(
//       `https://nominatim.openstreetmap.org/search?q=${address}&format=json&limit=1`
//     );
//     const data = await response.json();
//     if (data && data.length > 0) {
//       const { lat, lon } = data[0];
//       return [parseFloat(lat), parseFloat(lon)];
//     } else {
//       console.error("No coordinates found for the address:", address);
//       return null;
//     }
//   };

//   const handleSave = async () => {
//     // Fetch pickup and destination coordinates from address inputs
//     const pickupCoords = await getCoordinates(pickupLocation);
//     const destinationCoords = await getCoordinates(destinationLocation);

//     if (pickupCoords && destinationCoords) {
//       // Set coordinates
//       setPickupCoords(pickupCoords);
//       setDestinationCoords(destinationCoords);

//       // Log coordinates in the console
//       console.log("Pickup Coordinates:", pickupCoords);
//       console.log("Destination Coordinates:", destinationCoords);

//       // Prepare data for the backend
//       const riderData = {
//         // pickupLocation,
//         // destinationLocation,
//         // pickupCoords: 
//         // pickupCoords,
//         // destinationCoords:
//         //  destinationCoords,
//         pickupCoords: [pickupCoords[1], pickupCoords[0]],  // Convert to [lng, lat]
//         destinationCoords: [destinationCoords[1], destinationCoords[0]],
//       };
//       console.log(riderData);

//       // Send rider data to the backend
//       try {
//         const response = await fetch("http://localhost:5000/match-drivers", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(riderData),
//         });

        
//         // setDriverList(data.drivers);
//         if (response.ok) {
//           const data = await response.json();
//           setDriverList(data.drivers); // Update the state with the list of matched drivers
//           console.log("Matching drivers:", data.drivers); // Show matched drivers in console
//         } else {
//           console.error("Failed to find drivers");
//         }
//       } catch (error) {
//         console.error("Error finding drivers:", error);
//       }
//     }
//   };
//   const handleDriverClick = (driver) => {
//     const driverPickupCoords = [driver.waypoints.coordinates[0][1], driver.waypoints.coordinates[0][0]];
//     const driverDestinationCoords = [driver.waypoints.coordinates[1][1], driver.waypoints.coordinates[1][0]];

//     if (routingControl) {
//       routingControl.setWaypoints([]);
//       routingControl.remove();
//     }

//     const newRoutingControl = L.Routing.control({
//       waypoints: [
//         L.latLng(driverPickupCoords),
//         L.latLng(driverDestinationCoords),
//       ],
//       routeWhileDragging: true,
//       lineOptions: {
//         styles: [{ color: "black", opacity: 0.8, weight: 6 }],
//       },
//     }).addTo(map);

//     setRoutingControl(newRoutingControl);
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Rider Component</h1>

//       {/* Input form */}
//       <div className="mb-6">
//         <input
//           type="text"
//           placeholder="Pickup Location"
//           value={pickupLocation}
//           onChange={(e) => setPickupLocation(e.target.value)}
//           className="border border-gray-300 p-2 rounded mr-2 w-1/2"
//         />
//         <input
//           type="text"
//           placeholder="Destination Location"
//           value={destinationLocation}
//           onChange={(e) => setDestinationLocation(e.target.value)}
//           className="border border-gray-300 p-2 rounded w-1/2"
//         />
//         <button
//           onClick={handleSave}
//           className="bg-blue-500 text-white p-2 rounded mt-4 w-full"
//         >
//           Save
//         </button>
//       </div>

//       {/* Map Section */}
//       <div className="h-96 mb-6">
//         <MapContainer
//           center={[23.213, 77.404]}
//           zoom={15}
//           whenCreated={setMap}
//           style={{ height: "100%", width: "100%" }}
//         >
//           <TileLayer
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           />
//           {/* Add markers for pickup and destination coordinates */}
//           {pickupCoords && <Marker position={pickupCoords}></Marker>}
//           {destinationCoords && <Marker position={destinationCoords}></Marker>}
//          {/* Add a polyline for the selected driver's route */}
//          {/* {selectedDriverRoute && (
//             <Polyline positions={selectedDriverRoute} color="blue" />
//           )} */}
//         </MapContainer>
//       </div>

//       {/* Coordinates Display */}
//       <div className="mb-6">
//         <h2 className="text-xl font-semibold">Coordinates</h2>
//         <div className="grid grid-cols-2 gap-4">
//           <div className="bg-gray-100 p-4 rounded shadow">
//             <h3 className="font-bold">Pickup Coordinates:</h3>
//             {pickupCoords ? (
//               <p>Lat: {pickupCoords[0]}, Lng: {pickupCoords[1]}</p>
//             ) : (
//               <p>No pickup coordinates selected</p>
//             )}
//           </div>
//           <div className="bg-gray-100 p-4 rounded shadow">
//             <h3 className="font-bold">Destination Coordinates:</h3>
//             {destinationCoords ? (
//               <p>Lat: {destinationCoords[0]}, Lng: {destinationCoords[1]}</p>
//             ) : (
//               <p>No destination coordinates selected</p>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Driver List Display */}
//       <div className="mb-6">
//         <h2 className="text-xl font-semibold">Available Drivers</h2>
//         <div className="space-y-4">
//           {driverList.length > 0 ? (
//             driverList.map((driver, index) => (
//               <div
//                 key={index}
//                 className="border border-gray-300 bg-white p-4 rounded shadow flex justify-between items-center hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
//                 onClick={() => handleDriverClick(driver)}
//               >
//                 <div>
//                   <p className="font-bold">{driver.name}</p>
//                   <p>Vehicle: {driver.vehicle}</p>
//                   <p>Seats: {driver.seats}</p>
//                   <p>Fare: ${driver.fare}</p>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <p>No drivers found</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RiderComponent;












// import { useEffect, useRef, useState } from "react";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import "leaflet-routing-machine";
// import "leaflet-control-geocoder";
// import { CiLocationOn } from "react-icons/ci";

// const Driver = () => {
//   const [startLocation, setPickup] = useState("");
//   const [destinationLocation, setDestination] = useState("");
//   const [waypoints, setWaypoints] = useState([]);
//   console.log("waypoints list :",waypoints);
//   const mapRef = useRef(null);
//   const routingControlRef = useRef(null);

//   useEffect(() => {
//     const map = L.map(mapRef.current).setView([23.215, 77.415], 15); // Initial view over Delhi
//     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//       attribution:
//         '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//     }).addTo(map);

//     const routingControl = L.Routing.control({
//       waypoints: [], // Initial empty waypoints
//       lineOptions: {
//         styles: [{ color: "blue", opacity: 0.8, weight: 6 }],
//       },
//       router: L.Routing.osrmv1({ serviceUrl: `https://router.project-osrm.org/route/v1` }),
//     }).addTo(map);

//     routingControlRef.current = routingControl;
//     return () => map.remove();
//   }, []);

//   const findRoute = () => {
//     if (startLocation && destinationLocation) {
//       L.Control.Geocoder.nominatim().geocode(startLocation, (pickupResults) => {
//         L.Control.Geocoder.nominatim().geocode(destinationLocation, (destinationResults) => {
//           if (pickupResults.length > 0 && destinationResults.length > 0) {
//             const pickupLatLng = pickupResults[0].center;
//             const destinationLatLng = destinationResults[0].center;

//             // Setting waypoints
//             routingControlRef.current.setWaypoints([
//               L.latLng(pickupLatLng.lat, pickupLatLng.lng),
//               L.latLng(destinationLatLng.lat, destinationLatLng.lng),
//             ]);

//             // Listen for the routing to be found and display all waypoints
//             routingControlRef.current.on("routesfound", function (e) {
//               const routes = e.routes;
//               const summary = routes[0].summary;
//               const waypoints = routes[0].coordinates;

//               console.log(`Total distance: ${summary.totalDistance} meters`);
//               console.log(`Total time: ${summary.totalTime / 60} minutes`);


//               // Save waypoints coordinates in state
//               setWaypoints(waypoints.map(waypoint => [waypoint.lat, waypoint.lng]));
              
//             });
//              // Fit map to route bounds
//               L.map("map").fitBounds([
//                 [pickupLatLng.lat, pickupLatLng.lng],
//                 [destinationLatLng.lat, destinationLatLng.lng],
//               ]);
//           } else {
//             alert("Could not find one of the locations.");
//           }
//         });
//       });
//     } else {
//       alert("Please enter both pickup and destination locations.");
//     }
//   };
//   const resetMap = () => {
   
//     routingControlRef.setWaypoints([]);
//     setPickup("");
//     setDestination("");
//   };

//   return (
//     <div className="min-h-screen lg:pt-[50px] mb-22 bg-white">
//       <div className="container p-1 mx-auto grid grid-cols-1 md:grid-cols-2">
//         <div
//           id="map"
//           ref={mapRef}
//           style={{ height: "500px", width: "100%" }}
//           className="relative z-10 flex-1 rounded-lg shadow-lg bg-gray-100"
//         ></div>
//         <div className="col-span-1 shadow-lg rounded-lg p-6">
//           <form>
//             <div className="flex flex-col p-2 gap-4 w-full">
//               <div className="relative">
//                 <input
//                   required
//                   type="text"
//                   className="border border-gray-200 w-full bg-gray-200 rounded-lg p-2 pr-10 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
//                   placeholder="Enter pickup location"
//                   value={startLocation}
//                   onChange={(e) => setPickup(e.target.value)}
//                 />
//                 <CiLocationOn className="absolute top-1/2 cursor-pointer right-3 text-2xl transform -translate-y-1/2 text-gray-800" />
//               </div>
//               <div className="relative">
//                 <input
//                   required
//                   type="text"
//                   className="border bg-gray-200 w-full border-gray-200 rounded-lg p-2 pr-10 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
//                   placeholder="Enter destination location"
//                   value={destinationLocation}
//                   onChange={(e) => setDestination(e.target.value)}
//                 />
//                 <CiLocationOn className="absolute top-1/2 cursor-pointer right-3 text-2xl transform -translate-y-1/2 text-gray-800" />
//               </div>
//               <div className="flex justify-between">
//                 <button
//                   type="button"
//                   onClick={findRoute}
//                   className="bg-blue-500 text-white rounded-md py-2 px-4"
//                 >
//                   Find Route
//                 </button>
//                 <button
//                 type="button"
//                 onClick={resetMap}
//                 className="bg-red-600 text-white p-1 rounded-lg transition-transform transform hover:scale-105"
//               >
//                 Reset
//               </button>
//               </div>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Driver;


// import { useEffect, useRef, useState } from "react";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import "leaflet-routing-machine";
// import "leaflet-control-geocoder";
// // import { CiLocationOn } from "react-icons/ci";

// // Function to calculate the distance between two coordinates
// const calculateDistance = (lat1, lon1, lat2, lon2) => {
//   const R = 6371e3; // Radius of Earth in meters
//   const φ1 = (lat1 * Math.PI) / 180;
//   const φ2 = (lat2 * Math.PI) / 180;
//   const Δφ = ((lat2 - lat1) * Math.PI) / 180;
//   const Δλ = ((lon2 - lon1) * Math.PI) / 180;

//   const a =
//     Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
//     Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//   return R * c; // in meters
// };

// const Driver = () => {
//   const [checkLocation1, setCheckLocation1] = useState("");
//   const [checkLocation2, setCheckLocation2] = useState("");

//   const mapRef = useRef(null);
//   const routingControlRef = useRef(null);
  
//   // eslint-disable-next-line no-unused-vars
//   const waypointsRef = useRef([]); // To store waypoints

//   const drivers = [
//     { name: "Driver 1", pickup: "Delhi", destination: "Mumbai" },
//     { name: "Driver 2", pickup: "Kolkata", destination: "Chennai" },
//     { name: "Driver 3", pickup: "jaipur", destination: "bhopal" },
//     { name: "Driver 4", pickup: "Jaipur", destination: "Ahmedabad" },
//     { name: "Driver 5", pickup: "Lucknow", destination: "Patna" },
//   ];

//   useEffect(() => {
//     const map = L.map(mapRef.current).setView([23.215, 77.415], 7); // Initial view
//     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//       attribution:
//         '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//     }).addTo(map);

//     const routingControl = L.Routing.control({
//       waypoints: [], // Initial empty waypoints
//       lineOptions: {
//         styles: [{ color: "black", opacity: 0.8, weight: 8 }],
//       },
//       router: L.Routing.osrmv1({ serviceUrl: `https://router.project-osrm.org/route/v1` }),
//     }).addTo(map);

//     routingControlRef.current = routingControl;
//     return () => map.remove();
//   }, []);

//   const checkDriversRoutes = () => {
//     if (checkLocation1 && checkLocation2) {
//       L.Control.Geocoder.nominatim().geocode(checkLocation1, (results1) => {
//         if (results1.length > 0) {
//           const checkLatLng1 = results1[0].center;

//           L.Control.Geocoder.nominatim().geocode(checkLocation2, (results2) => {
//             if (results2.length > 0) {
//               const checkLatLng2 = results2[0].center;

//               let matchingDrivers = [];

//               // Loop through each driver
//               drivers.forEach((driver,index) => {
//                 L.Control.Geocoder.nominatim().geocode(driver.pickup, (pickupResults) => {
//                   L.Control.Geocoder.nominatim().geocode(driver.destination, (destinationResults) => {
//                     if (pickupResults.length > 0 && destinationResults.length > 0) {
//                       const pickupLatLng = pickupResults[0].center;
//                       const destinationLatLng = destinationResults[0].center;

//                       // Set waypoints for this driver
//                       routingControlRef.current.setWaypoints([
//                         L.latLng(pickupLatLng.lat, pickupLatLng.lng),
//                         L.latLng(destinationLatLng.lat, destinationLatLng.lng),
//                       ]);

//                       routingControlRef.current.on("routesfound", function (e) {
//                         const routes = e.routes;
//                         const waypoints = routes[0].coordinates;

//                         let minDistance1 = Infinity;
//                         let minDistance2 = Infinity;

//                         // Calculate distances from checkLocation1 and checkLocation2 to the waypoints
//                         waypoints.forEach((waypoint) => {
//                           const distance1 = calculateDistance(
//                             checkLatLng1.lat,
//                             checkLatLng1.lng,
//                             waypoint.lat,
//                             waypoint.lng
//                           );
//                           if (distance1 < minDistance1) {
//                             minDistance1 = distance1;
//                           }

//                           const distance2 = calculateDistance(
//                             checkLatLng2.lat,
//                             checkLatLng2.lng,
//                             waypoint.lat,
//                             waypoint.lng
//                           );
//                           if (distance2 < minDistance2) {
//                             minDistance2 = distance2;
//                           }
//                         });

//                         // Check if both locations are on the route
//                         if (minDistance1 < 4000 && minDistance2 < 4000) {
//                           matchingDrivers.push(driver.name);
//                         }

//                           // If all drivers have been checked, display the result
//                           if (index === drivers.length - 1) {
//                             if (matchingDrivers.length > 0) {
//                               console.log("Matching drivers: ", matchingDrivers);
//                             } else {
//                               console.log("No matching drivers found.");
//                             }
//                           }

//                         // // If all drivers have been checked, display the result
//                         // if (matchingDrivers.length > 0) {
//                         //   alert(`Matching drivers: ${matchingDrivers.join(", ")}`);
//                         // } else {
//                         //   alert("No matching drivers found.");
//                         // }
//                       });
//                     }
//                   });
//                 });
//               });
//             } else {
//               alert("Could not find the second location to check.");
//             }
//           });
//         } else {
//           alert("Could not find the first location to check.");
//         }
//       });
//     } else {
//       alert("Please enter both locations to check.");
//     }
//   };

//   return (
//     <div>
//       <div className="map-container" ref={mapRef} style={{ height: "400px" }}></div>

//       <input
//         type="text"
//         value={checkLocation1}
//         onChange={(e) => setCheckLocation1(e.target.value)}
//         placeholder="Enter first location to check"
//       />
//       <input
//         type="text"
//         value={checkLocation2}
//         onChange={(e) => setCheckLocation2(e.target.value)}
//         placeholder="Enter second location to check"
//       />
//       <button onClick={checkDriversRoutes}>Check Drivers Routes</button>
//     </div>
//   );
// };

// export default Driver;






// // import { useEffect, useRef, useState } from "react";
// // import "leaflet/dist/leaflet.css";
// // import L from "leaflet";
// // import "leaflet-routing-machine";
// // import "leaflet-control-geocoder";
// // import { CiLocationOn } from "react-icons/ci";

// // // Function to calculate the distance between two coordinates
// // const calculateDistance = (lat1, lon1, lat2, lon2) => {
// //   const R = 6371e3; // Radius of Earth in meters
// //   const φ1 = (lat1 * Math.PI) / 180;
// //   const φ2 = (lat2 * Math.PI) / 180;
// //   const Δφ = ((lat2 - lat1) * Math.PI) / 180;
// //   const Δλ = ((lon2 - lon1) * Math.PI) / 180;

// //   const a =
// //     Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
// //     Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
// //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

// //   return R * c; // in meters
// // };

// // const Driver = () => {
// //   const [startLocation, setPickup] = useState("");
// //   const [destinationLocation, setDestination] = useState("");

// //   const [checkLocation1, setCheckLocation1] = useState("");
// //   const [checkLocation2, setCheckLocation2] = useState("");
// //    // For checking location

// //   const mapRef = useRef(null);
// //   const routingControlRef = useRef(null);
// //   const waypointsRef = useRef([]); // To store waypoints

// //   useEffect(() => {
// //     const map = L.map(mapRef.current).setView([23.215, 77.415], 7); // Initial view over Delhi
// //     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
// //       attribution:
// //         '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
// //     }).addTo(map);

// //     const routingControl = L.Routing.control({
// //       waypoints: [], // Initial empty waypoints
// //       lineOptions: {
// //         styles: [{ color: "black", opacity: 0.8, weight: 8 }],
// //       },
// //       router: L.Routing.osrmv1({ serviceUrl: `https://router.project-osrm.org/route/v1` }),
// //     }).addTo(map);

// //     routingControlRef.current = routingControl;
// //     return () => map.remove();
// //   }, []);

// //   const findRoute = () => {
// //     if (startLocation && destinationLocation) {
// //       L.Control.Geocoder.nominatim().geocode(startLocation, (pickupResults) => {
// //         L.Control.Geocoder.nominatim().geocode(destinationLocation, (destinationResults) => {
// //           if (pickupResults.length > 0 && destinationResults.length > 0) {
// //             const pickupLatLng = pickupResults[0].center;
// //             const destinationLatLng = destinationResults[0].center;

// //             // Setting waypoints
// //             routingControlRef.current.setWaypoints([
// //               L.latLng(pickupLatLng.lat, pickupLatLng.lng),
// //               L.latLng(destinationLatLng.lat, destinationLatLng.lng),
// //             ]);

// //             // Listen for the routing to be found and display all waypoints
// //             routingControlRef.current.on("routesfound", function (e) {
// //               const routes = e.routes;
// //               const waypoints = routes[0].coordinates;

// //               // Store waypoints in ref
// //               waypointsRef.current = waypoints;

// //               console.log(`Total distance: ${routes[0].summary.totalDistance} meters`);
// //               console.log(`Total time: ${routes[0].summary.totalTime / 60} minutes`);

// //               // Print each waypoint's coordinates
// //               waypoints.forEach((waypoint, index) => {
// //                 console.log(
// //                   `Waypoint ${index + 1}: Latitude: ${waypoint.lat}, Longitude: ${waypoint.lng}`
// //                 );
// //               });
// //             });
// //           } else {
// //             alert("Could not find one of the locations.");
// //           }
// //         });
// //       });
// //     } else {
// //       alert("Please enter both pickup and destination locations.");
// //     }
// //   };

// //   const checkIfLocationOnRoute = () => {
// //     if (checkLocation1 && checkLocation2 && waypointsRef.current.length > 0) {
// //       L.Control.Geocoder.nominatim().geocode(checkLocation1, (results1) => {
// //         if (results1.length > 0) {
// //           const checkLatLng1 = results1[0].center;
// //           let minDistance1 = Infinity;
  
// //           // Calculate distance from the first location to the waypoints
// //           waypointsRef.current.forEach((waypoint) => {
// //             const distance = calculateDistance(
// //               checkLatLng1.lat,
// //               checkLatLng1.lng,
// //               waypoint.lat,
// //               waypoint.lng
// //             );
// //             if (distance < minDistance1) {
// //               minDistance1 = distance;
// //             }
// //           });


// //          // Geocode the second location
// //         L.Control.Geocoder.nominatim().geocode(checkLocation2, (results2) => {
// //           if (results2.length > 0) {
// //             const checkLatLng2 = results2[0].center;
// //             let minDistance2 = Infinity;

// //             // Calculate distance from the second location to the waypoints
// //             waypointsRef.current.forEach((waypoint) => {
// //               const distance = calculateDistance(
// //                 checkLatLng2.lat,
// //                 checkLatLng2.lng,
// //                 waypoint.lat,
// //                 waypoint.lng
// //               );
// //               if (distance < minDistance2) {
// //                 minDistance2 = distance;
// //               }
// //             });

// //             // Check if both locations are within a 400-meter proximity to the route
// //             if (minDistance1 < 400 && minDistance2 < 400) {
// //               alert(
// //                 `Both locations are on the route!\nMinimum distance for Location 1: ${minDistance1.toFixed(2)} meters\nMinimum distance for Location 2: ${minDistance2.toFixed(2)} meters`
// //               );
// //             } else if (minDistance1 < 400) {
// //               alert(
// //                 `Only Location 1 is on the route!\nMinimum distance for Location 1: ${minDistance1.toFixed(2)} meters\nLocation 2 is NOT on the route. Minimum distance: ${minDistance2.toFixed(2)} meters`
// //               );
// //             } else if (minDistance2 < 400) {
// //               alert(
// //                 `Only Location 2 is on the route!\nMinimum distance for Location 2: ${minDistance2.toFixed(2)} meters\nLocation 1 is NOT on the route. Minimum distance: ${minDistance1.toFixed(2)} meters`
// //               );
// //             } else {
// //               alert(
// //                 `Neither Location 1 nor Location 2 are on the route.\nMinimum distance for Location 1: ${minDistance1.toFixed(2)} meters\nMinimum distance for Location 2: ${minDistance2.toFixed(2)} meters`
// //               );
// //             }
// //           } else {
// //             alert("Could not find the second location to check.");
// //           }
// //         });
// //       } else {
// //         alert("Could not find the first location to check.");
// //       }
// //     });
// //   } else {
// //     alert("Please enter both locations to check and ensure a route is found.");
// //   }
// // };
// //   const resetMap = () => {
// //     // Reset the map and clear waypoints
// //     routingControlRef.current.setWaypoints([]);
// //     setPickup("");
// //     setDestination("");
// //     setCheckLocation1("");
// //     setCheckLocation2("");
// //     waypointsRef.current = []; // Clear waypoints
// //   };

// //   return (
// //     <div className="min-h-screen lg:pt-[50px] mb-22 bg-white">
// //       <div className="container p-1 mx-auto grid grid-cols-1 md:grid-cols-2">
// //         <div
// //           id="map"
// //           ref={mapRef}
// //           style={{ height: "350px", width: "100%" }}
// //           className="relative z-10 flex-1 md:h-[120vh] lg:h-[150vh] rounded-lg shadow-lg bg-gray-100"
// //         ></div>
// //         <div className="bg-white p-4">
// //           <form className="space-y-4">
// //             <div>
// //               <label className="text-sm font-bold text-gray-800">
// //                 Pickup Location
// //               </label>
// //               <div className="relative">
// //                 <input
// //                   type="text"
// //                   className="border bg-gray-200 border-gray-200 rounded-lg p-2 w-full text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
// //                   placeholder="Enter a Pickup Location"
// //                   value={startLocation}
// //                   onChange={(e) => setPickup(e.target.value)}
// //                 />
// //                 <CiLocationOn className="absolute top-3 right-3 text-gray-800" />
// //               </div>
// //             </div>
// //             <div>
// //               <label className="text-sm font-bold text-gray-800">
// //                 Destination Location
// //               </label>
// //               <div className="relative">
// //                 <input
// //                   type="text"
// //                   className="border bg-gray-200 border-gray-200 rounded-lg p-2 w-full text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
// //                   placeholder="Enter a Destination Location"
// //                   value={destinationLocation}
// //                   onChange={(e) => setDestination(e.target.value)}
// //                 />
// //                 <CiLocationOn className="absolute top-3 right-3 text-gray-800" />
// //               </div>
// //               <button
// //                 className="bg-green-500 p-2 text-white w-full text-md rounded-lg hover:bg-green-700"
// //                 type="button"
// //                 onClick={findRoute}
// //               >
// //                 Find Route
// //               </button>
// //               <div className="gap-3">
// //               <input
// //                 type="text"
// //                 className="border bg-gray-200 border-gray-200 rounded-lg p-2 w-full text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
// //                 placeholder="Enter a location to check if on route"
// //                 value={checkLocation1}
// //                 onChange={(e) => setCheckLocation1(e.target.value)}
// //               />
// //               <input
// //                 type="text"
// //                 className="border bg-gray-200 border-gray-200 rounded-lg p-2 w-full text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
// //                 placeholder="Enter a location to check if on route"
// //                 value={checkLocation2}
// //                 onChange={(e) => setCheckLocation2(e.target.value)}
// //               />
// //               <button
// //                 className="bg-blue-500 p-2 text-white w-full text-md rounded-lg hover:bg-blue-700"
// //                 type="button"
// //                 onClick={checkIfLocationOnRoute}
// //               >
// //                 Check Location
// //               </button>
// //               </div>
// //               <button
// //                 className="bg-red-500 p-2 text-white w-full text-md rounded-lg hover:bg-red-700"
// //                 type="button"
// //                 onClick={resetMap}
// //               >
// //                 Reset Map
// //               </button>
// //             </div>
// //           </form>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Driver;

















// // import { useEffect, useRef, useState } from "react";
// // import "leaflet/dist/leaflet.css";
// // import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
// // import "leaflet-control-geocoder/dist/Control.Geocoder.css";
// // import L from "leaflet";
// // import "leaflet-routing-machine";
// // import "leaflet-control-geocoder";
// // // import { useNavigate } from "react-router-dom";
// // import { CiLocationOn } from "react-icons/ci";

// // const Driver = () => {
// //   const [startLocation, setPickup] = useState("");
// //   const [destinationLocation, setDestination] = useState("");
// //   const [checkLocation, setCheckLocation] = useState(""); // For the location to check
// //   // const handleNavigate = () => {
// //   //   if (startLocation && destinationLocation) {
// //   //     navigate("/driverform", {
// //   //       state: { startLocation, destinationLocation },
// //   //     });
// //   //   } else {
// //   //     alert("Please fill input");
// //   //   }
// //   // };

// //   const mapRef = useRef(null);
// //   const mapInstanceRef = useRef(null);
// //   const routingControlRef = useRef(null);

// //   const [routingControl, setRoutingControl] = useState(null);
// //   const waypointsRef = useRef([]);
// //   const markersRef = useRef([]);

// //   useEffect(() => {
// //     const map = L.map(mapRef.current).setView([23.215, 77.415], 15);
// //     const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
// //     const attribution =
// //       '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
// //     const tiles = L.tileLayer(tileUrl, { attribution });
// //     tiles.addTo(map);

// //     const control = L.Routing.control({
// //       waypoints: [],
// //       lineOptions: {
// //         styles: [{ color: "black", opacity: 0.8, weight: 6 }],
// //       },
// //     }).addTo(map);

// //     mapInstanceRef.current = map; // Store the map instance
// //     routingControlRef.current = control;
// //     map.on("click", onMapClick);

// //     setRoutingControl(control);

// //     return () => {
// //       map.off("click", onMapClick);
// //       map.remove();
// //     };
// //   // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, []);

// //   const findRoute = () => {
// //     if (startLocation && destinationLocation) {
// //       L.Control.Geocoder.nominatim().geocode(startLocation, (pickupResults) => {
// //         L.Control.Geocoder.nominatim().geocode(
// //           destinationLocation,
// //           (destinationResults) => {
// //             if (pickupResults.length > 0 && destinationResults.length > 0) {
// //               const pickupLatLng = pickupResults[0].center;
// //               const destinationLatLng = destinationResults[0].center;

// //               routingControl.setWaypoints([
// //                 L.latLng(pickupLatLng.lat, pickupLatLng.lng),
// //                 L.latLng(destinationLatLng.lat, destinationLatLng.lng),
// //               ]);

// //               L.map("map").fitBounds([
// //                 [pickupLatLng.lat, pickupLatLng.lng],
// //                 [destinationLatLng.lat, destinationLatLng.lng],
// //               ]);

// //               const pickupMarker = L.marker(pickupLatLng)
// //                 .addTo(L.map("map"))
// //                 .bindPopup("Pickup: " + pickupResults[0].name)
// //                 .openPopup();

// //               const destinationMarker = L.marker(destinationLatLng)
// //                 .addTo(L.map("map"))
// //                 .bindPopup("Destination: " + destinationResults[0].name)
// //                 .openPopup();

// //               markersRef.current.push(pickupMarker, destinationMarker);
// //             } else {
// //               alert("Could not find one of the locations.");
// //             }
// //           }
// //         );
// //       });
// //     } else {
// //       alert("Please enter both pickup and destination locations.");
// //     }
// //   };

// //   const checkIfLocationOnRoute = () => {
// //     if (!checkLocation) {
// //       alert("Please enter a location to check");
// //       return;
// //     }

// //     L.Control.Geocoder.nominatim().geocode(checkLocation, (checkResults) => {
// //       if (checkResults.length > 0) {
// //         const checkLatLng = checkResults[0].center;
// //         const routeCoordinates = routingControl.getPlan().getWaypoints();

// //         const distanceToRoute = routeCoordinates.map((point) => {
// //           const pointLatLng = L.latLng(point.latLng.lat, point.latLng.lng);
// //           return pointLatLng.distanceTo(checkLatLng);
// //         });

// //         const isLocationOnRoute = distanceToRoute.some(
// //           (distance) => distance < 5000 // Adjust threshold based on the proximity you desire
// //         );

// //         if (isLocationOnRoute) {
// //           alert("Yes, the location is on the route.");
// //           L.marker(checkLatLng)
// //             .addTo(mapInstanceRef.current)
// //             .bindPopup("Check Location: " + checkResults[0].name)
// //             .openPopup();
// //         } else {
// //           alert("No, the location is not on the route.");
// //         }
// //       } else {
// //         alert("Could not find the location.");
// //       }
// //     });
// //   };

// //   const resetMap = () => {
// //     waypointsRef.current = [];
// //     markersRef.current.forEach((marker) => marker.remove());
// //     markersRef.current = [];
// //     routingControl.setWaypoints([]);
// //     setPickup("");
// //     setDestination("");
// //     setCheckLocation(""); // Reset the check location
// //   };

// //   const onMapClick = (e) => {
// //     const map = mapInstanceRef.current;

// //     if (waypointsRef.current.length < 2) {
// //       const latlng = e.latlng;

// //       L.Control.Geocoder.nominatim().reverse(
// //         latlng,
// //         map.options.crs.scale(map.getZoom()),
// //         (results) => {
// //           if (results && results.length > 0) {
// //             const result = results[0];
// //             const address = result.name || result.html || "Unknown location";

// //             if (waypointsRef.current.length === 0) {
// //               setPickup(address);
// //             } else {
// //               setDestination(address);
// //             }

// //             const marker = L.marker(latlng)
// //               .addTo(map)
// //               .bindPopup(
// //                 waypointsRef.current.length === 0
// //                   ? "Pickup: " + address
// //                   : "Destination: " + address
// //               )
// //               .openPopup();

// //             markersRef.current.push(marker);
// //             waypointsRef.current.push(latlng);

// //             if (waypointsRef.current.length === 2) {
// //               routingControl.current.setWaypoints(waypointsRef.current);
// //               map.fitBounds(L.latLngBounds(waypointsRef.current));
// //             }
// //           } else {
// //             alert("Reverse geocoding failed. Please try another location.");
// //           }
// //         }
// //       );
// //     } else {
// //       alert(
// //         "Both pickup and destination are already set. Please reset to change locations."
// //       );
// //     }
// //   };

// //   // const navigate = useNavigate();

// //   return (
// //     <div className="min-h-screen lg:pt-[50px] mb-22 bg-white">
// //       <div className="container p-1 mx-auto grid grid-cols-1 md:grid-cols-2">
// //         <div
// //           id="map"
// //           ref={mapRef}
// //           style={{ height: "350px", width: "100%" }}
// //           className="relative z-10 flex-1 md:h-[120vh] lg:h-[150vh] rounded-lg shadow-lg bg-gray-100"
// //           onClick={onMapClick}
// //         ></div>
// //         <div className="col-span-1 shadow-lg rounded-lg p-6">
// //           <form>
// //             <div className="flex flex-col p-2 gap-4 w-full">
// //               <div className="relative">
// //                 <input
// //                   required
// //                   type="text"
// //                   className="border border-gray-200 w-full bg-gray-200 rounded-lg p-2 pr-10 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
// //                   placeholder="Enter pickup location"
// //                   value={startLocation}
// //                   onChange={(e) => setPickup(e.target.value)}
// //                 />
// //                 <CiLocationOn className="absolute top-1/2 cursor-pointer right-3 text-2xl transform -translate-y-1/2 text-gray-800" />
// //               </div>
// //               <div className="relative">
// //                 <input
// //                   required
// //                   type="text"
// //                   className="border bg-gray-200 w-full border-gray-200 rounded-lg p-2 pr-10 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
// //                   placeholder="Enter destination location"
// //                   value={destinationLocation}
// //                   onChange={(e) => setDestination(e.target.value)}
// //                 />
// //                 <CiLocationOn className="absolute top-1/2 cursor-pointer right-3 text-2xl transform -translate-y-1/2 text-gray-800" />
// //               </div>
// //               <div className="relative">
// //                 <input
// //                   type="text"
// //                   className="border bg-gray-200 w-full border-gray-200 rounded-lg p-2 pr-10 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
// //                   placeholder="Enter location to check"
// //                   value={checkLocation}
// //                   onChange={(e) => setCheckLocation(e.target.value)}
// //                 />
// //                 <CiLocationOn className="absolute top-1/2 cursor-pointer right-3 text-2xl transform -translate-y-1/2 text-gray-800" />
// //               </div>
// //               <div className="flex justify-between">
// //                 <button
// //                   type="button"
// //                   onClick={findRoute}
// //                   className="bg-blue-500 text-white rounded-md py-2 px-4"
// //                 >
// //                   Find Route
// //                 </button>
// //                 <button
// //                   type="button"
// //                   onClick={checkIfLocationOnRoute}
// //                   className="bg-green-500 text-white rounded-md py-2 px-4"
// //                 >
// //                   Check Location on Route
// //                 </button>
// //                 <button
// //                   type="button"
// //                   onClick={resetMap}
// //                   className="bg-red-500 text-white rounded-md py-2 px-4"
// //                 >
// //                   Reset Map
// //                 </button>
// //               </div>
// //             </div>
// //           </form>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Driver;





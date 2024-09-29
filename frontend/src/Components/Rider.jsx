import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-control-geocoder";
import { RxCross2 } from "react-icons/rx";
// import { CiLocationOn } from "react-icons/ci";
//  import { useNavigate } from "react-router-dom";
// import DriverList from "./DriverList";

import { FaCar, FaBus, FaMotorcycle } from "react-icons/fa";
// import axios from "axios";

const Rider = () => {
  const [showDriverList, setShowDriverList] = useState(false);
  const mapRef = useRef(null);
  const [routingControl, setRoutingControl] = useState(null);
  const waypointsRef = useRef([]);
  const markersRef = useRef([]);
  // const [pickup, setPickup] = useState("");
  // const [destination, setDestination] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [destinationLocation, setDestinationLocation] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [driverList, setDriverList] = useState([]);
  const [suggestions, setSuggestions] = useState({
    pickup: [],
    destination: [],
  });
  // const [selectedDriver, setSelectedDriver] = useState(null);
  // console.log(selectedDriver);
  // console.log("Rider pickup :", riderPickup);
  // console.log("Rider destination :", riderDestination);
  console.log("Rider pickupCoord :", pickupCoords);
  console.log("Rider destinationCoord :", destinationCoords);

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (pickupCoords && destinationCoords) {
  //     const riderData = {
  //       pickupAddress: riderPickup,
  //       destinationAddress: riderDestination,
  //       pickupCoords,
  //       destinationCoords,
  //     };
  //     console.log("Rider data :",riderData);

  //     try {
  //       // Send data to backend for matching drivers
  //       const response = await axios.post("http://localhost:5000/match-drivers", riderData);
  //       setDrivers(response.data.drivers); // Save matched drivers in state
  //     } catch (error) {
  //       console.error("Error matching drivers:", error);
  //     }
  //   } else {
  //     alert("Geocode the locations first.");
  //   }
  // };

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
    setShowDriverList(true);
  };

  // const handleConfirm = () => {
  //   setShowDriverList(true);
  // };
  const handleBackToInput = () => {
    setShowDriverList(false);
  };

  const handleDriverClick = (driver) => {
    // You can handle any action when the driver is clicked here
    // setSelectedDriver(driver); // Set the selected driver
    console.log("Driver clicked:", driver);

    // Optionally, you can zoom to the driver's route on the map or highlight it
    const driverPickup = driver.startLocation;
    const driverDestination = driver.destinationLocation;

    if (driverPickup && driverDestination) {
      L.Control.Geocoder.nominatim().geocode(driverPickup, (pickupResults) => {
        L.Control.Geocoder.nominatim().geocode(
          driverDestination,
          (destinationResults) => {
            if (pickupResults.length > 0 && destinationResults.length > 0) {
              const pickupLatLng = pickupResults[0].center;
              const destinationLatLng = destinationResults[0].center;

              // Set waypoints for routing control
              routingControl.setWaypoints([
                L.latLng(pickupLatLng.lat, pickupLatLng.lng),
                L.latLng(destinationLatLng.lat, destinationLatLng.lng),
              ]);

              //Fit map to route bounds
              L.map("map").fitBounds([
                [pickupLatLng.lat, pickupLatLng.lng],
                [destinationLatLng.lat, destinationLatLng.lng],
              ]);

              // Add markers
              const pickupMarker = L.marker(pickupLatLng)
                .addTo(L.map("map"))
                .bindPopup("Pickup: " + pickupResults[0].name)
                .openPopup();

              const destinationMarker = L.marker(destinationLatLng)
                .addTo(L.map("map"))
                .bindPopup("Destination: " + destinationResults[0].name)
                .openPopup();

              markersRef.current.push(pickupMarker, destinationMarker);
            } else {
              alert("Could not find one of the locations.");
            }
          }
        );
      });
    } else {
      alert("Please enter both pickup and destination locations.");
    }
  };

  useEffect(() => {
    // Initialize the map
    const map = L.map(mapRef.current).setView([23.215, 77.415], 15);
    const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    const attribution =
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    const tiles = L.tileLayer(tileUrl, { attribution });
    tiles.addTo(map);

    //ROUTE FORMATION
    const control = L.Routing.control({
      waypoints: [],
      routeWhileDragging: true,
      // geocoder: L.Control.Geocoder.nominatim(),
      geocoder: false,
      lineOptions: {
        styles: [{ color: "black", opacity: 0.8, weight: 6 }],
      },
    }).addTo(map);

    setRoutingControl(control);

    // Cleanup on component unmount
    return () => {
      map.remove();
    };
  }, []);

  //RESET MAP BUTTON
  const resetMap = () => {
    waypointsRef.current = [];
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    routingControl.setWaypoints([]);
    // setPickup("");
    // setDestination("");
    setPickupLocation("");
    setDestinationLocation("");
    setSuggestions({ pickup: [], destination: [] });
  };
  const resetPickup = () => {
    setPickupLocation("");
    
  };
  const resetDestination = () => {
    setDestinationLocation("");
    
  };

    // Function to fetch suggestions from Nominatim
    const fetchSuggestions = (query, field) => {
      if (query.length < 3) return;
  
      const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=5`;
  
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          const formattedSuggestions = data.map((item) => ({
            label: item.display_name,
            latLng: [item.lat, item.lon],
          }));
  
          if (field === "pickup") {
            setSuggestions((prev) => ({ ...prev, pickup: formattedSuggestions }));
          } else if (field === "destination") {
            setSuggestions((prev) => ({
              ...prev,
              destination: formattedSuggestions,
            }));
          }
        })
        .catch((error) => console.error("Error fetching suggestions:", error));
    };
  
    const handleSuggestionClick = (suggestion, field) => {
      if (field === "pickup") {
        setPickupLocation(suggestion.label);
        setSuggestions((prev) => ({ ...prev, pickup: [] }));
      } else if (field === "destination") {
        setDestinationLocation(suggestion.label);
        setSuggestions((prev) => ({ ...prev, destination: [] }));
      }
    };

  return (
    // <div className="relative z-10 flex flex-col h-screen pt-6 pb-4  bg-gray-100 ">
    <div className="  lg:pt-[40px]    bg-white h-screen md:h-auto lg:h-screen  ">
      <div className="container p-2 h-96 grid grid-cols-1 lg:grid-cols-2    ">
        {/* MAP COMPONENT */}
        <div
          id="map"
          ref={mapRef}
          style={{ width: "100%" }}
          className="relative z-10 flex-1 h-96 lg:h-auto   rounded-lg shadow-lg "
          // onClick={onMapClick}
        ></div>

        <div className="relative col-span-1 shadow-lg   pt-2 lg:pt-1  rounded ">
          {!showDriverList ? (
            <div
              // onSubmit={}
              className="p-2"
            >
              <div className="flex flex-col p-4 gap-4 md:flex-col  w-full">
                <div className="relative">
                  <input
                    type="text"
                    className="border bg-gray-200 border-gray-200 rounded-lg p-2 pr-10 w-full  text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter pickup location"
                    value={pickupLocation}
                    onChange={(e) =>{ setPickupLocation(e.target.value);
                      fetchSuggestions(e.target.value, "pickup");}}
                  />
                 <RxCross2
                  onClick={resetPickup}
                  className="absolute top-1/2  cursor-pointer right-3 text-xl  transform -translate-y-1/2 text-gray-600"
                />
                {suggestions.pickup.length > 0 && (
                  <ul className="absolute top-full left-0 bg-white shadow-lg w-full z-10 max-h-40 overflow-y-auto">
                    {suggestions.pickup.map((suggestion, idx) => (
                    
                       
                        <li
                          key={idx}
                          className="p-2 hover:bg-gray-200  cursor-pointer"
                          onClick={() =>
                            handleSuggestionClick(suggestion, "pickup")
                          }
                        >
                           {/* <CiLocationOn  className="absolute top-1/2  cursor-pointer left-2 text-xl  transform -translate-y-1/2 text-gray-600" /> */}
                          {suggestion.label}
                        </li>
                      
                    ))}
                  </ul>
                )}
                </div>
                <div className="relative ">
                  <input
                    type="text"
                    className="border bg-gray-200 border-gray-200 rounded-lg p-2 pr-10 w-full  text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter destination location"
                    value={destinationLocation}
                    onChange={(e) => {setDestinationLocation(e.target.value);
                      fetchSuggestions(e.target.value, "destination");}}
                  />
                 <RxCross2
                  onClick={resetDestination}
                  className="absolute top-1/2  cursor-pointer right-3 text-xl  transform -translate-y-1/2 text-gray-600"
                />
                 {suggestions.destination.length > 0 && (
                  <ul className="absolute top-full left-0 bg-white shadow-lg w-full z-10 max-h-40 overflow-y-auto">
                    {suggestions.destination.map((suggestion, idx) => (
                      <li
                        key={idx}
                        className="p-2 hover:bg-gray-200 cursor-pointer"
                        onClick={() =>
                          handleSuggestionClick(suggestion, "destination")
                        }
                      >
                        {suggestion.label}
                      </li>
                    ))}
                  </ul>
                )}
                </div>
              </div>
              <div className="flex px-4 space-x-6  md:mt-0">
                <button
                  type="button"
                  // onClick={handleSave}
                  onClick={() => {
                    handleSave();
                  }}
                  className="bg-blue-600 text-white p-1 rounded-lg transition-transform transform hover:scale-105"
                >
                  Save
                </button>

                <button
                  type="button"
                  onClick={resetMap}
                  className="bg-red-600 text-white p-1 rounded-lg transition-transform transform hover:scale-105"
                >
                  Reset
                </button>
              </div>
              <button
                className="bg-black text-white px-2 py-2 mt-20  rounded w-full"
                // onClick ={()=>{handleConfirm()}}
                type="submit"
              >
                Confirm
              </button>
            </div>
          ) : (
            // {submittedData && <DriverList data={submittedData} />}
            <div className="border border-gray-300 p-4 rounded  inset-x-0 bottom-0 border-t  rounded-t-lg animate-slide-up">
              <button
                className="absolute top-5 right-5  text-3xl text-gray-700 hover:text-gray-900"
                onClick={handleBackToInput}
              >
                <RxCross2 />
              </button>
              <div className="text-3xl text-center">
                <h1>Available Drivers</h1>
              </div>

              {/* DRIVER LIST */}
              {/* <DriverList /> */}
              <div
                className="grid grid-cols-1 bg-gray-50 rounded-lg  lg:mt-5 gap-4 p-1 max-h-[380px] overflow-y-scroll "
                style={{ scrollbarWidth: 1, msOverflowStyle: "none" }}
              >
                {driverList.length > 0 ? (
                  driverList.map((driver, index) => (
                    <div
                      key={index}
                      onClick={() => handleDriverClick(driver)}
                      className="bg-gray-200 flex items-center justify-between gap-4 rounded-3xl w-full shadow-md p-3 cursor-pointer hover:bg-slate-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="">
                          {driver.vehicle.trim().toLowerCase() === "car" && (
                            <FaCar className="text-3xl" />
                          )}
                          {driver.vehicle.trim().toLowerCase() === "bus" && (
                            <FaBus className="text-3xl" />
                          )}
                          {driver.vehicle.trim().toLowerCase() === "bike" && (
                            <FaMotorcycle className="text-3xl" />
                          )}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">{driver.name}</h2>
                          <p>
                            <strong>Seats:</strong> {driver.seats}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <h2>
                          <p className="text-lg font-semibold">
                            Rs {driver.fare}
                          </p>
                        </h2>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="justify-center text-2xl"> 
                    <p>No drivers found</p>
                    </div>
                  
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rider;

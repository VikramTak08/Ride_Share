import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-control-geocoder";

import { useNavigate } from "react-router-dom";
// import { CiLocationOn } from "react-icons/ci";
import { RxCross2 } from "react-icons/rx";
// import DriverForm from "./DriverForm";

const Driver = () => {
  const [startLocation, setPickup] = useState("");
  const [destinationLocation, setDestination] = useState("");
  const [waypoints, setWaypoints] = useState([]);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null); //for onmapclick function
  const routingControlRef = useRef(null);
  const [routingControl, setRoutingControl] = useState(null);
  const waypointsRef = useRef([]);
  const markersRef = useRef([]);
  const [suggestions, setSuggestions] = useState({
    pickup: [],
    destination: [],
  });

  console.log("waypoints :", waypoints);

  const handleNavigate = () => {
    if (startLocation && destinationLocation) {
      navigate("/driverform", {
        state: { startLocation, destinationLocation, waypoints },
      });
    } else {
      alert("please fill input");
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

    const control = L.Routing.control({
      waypoints: [],
      routeWhileDragging: true,
      //  geocoder: L.Control.Geocoder.nominatim(),
      // geocoder: true,
      lineOptions: {
        styles: [{ color: "black", opacity: 0.8, weight: 6 }],
      },
    }).addTo(map);

    mapInstanceRef.current = map; // Store the map instance
    routingControlRef.current = routingControl;

    // Listen for the routing to be found and display all waypoints
    control.on("routesfound", function (e) {
      const routes = e.routes;
      const summary = routes[0].summary;
      const waypoints = routes[0].coordinates;

      console.log(`Total distance: ${summary.totalDistance} meters`);
      console.log(`Total time: ${summary.totalTime / 60} minutes`);

      // Save waypoints coordinates in state
      setWaypoints(waypoints.map((waypoint) => [waypoint.lat, waypoint.lng]));
    });

    // map.on("click", onMapClick);

    setRoutingControl(control);

    // Cleanup on component unmount
    return () => {
      // map.off("click", onMapClick);
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const findRoute = () => {
    if (startLocation && destinationLocation) {
      L.Control.Geocoder.nominatim().geocode(startLocation, (pickupResults) => {
        L.Control.Geocoder.nominatim().geocode(
          destinationLocation,
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

  const resetMap = () => {
    waypointsRef.current = [];
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    routingControl.setWaypoints([]);
    setPickup("");
    setDestination("");
    setSuggestions({ pickup: [], destination: [] });
  };

  const resetPickup = () => {
    setPickup("");
    
  };
  const resetDestination = () => {
    setDestination("");
    
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
      setPickup(suggestion.label);
      setSuggestions((prev) => ({ ...prev, pickup: [] }));
    } else if (field === "destination") {
      setDestination(suggestion.label);
      setSuggestions((prev) => ({ ...prev, destination: [] }));
    }
  };

  const navigate = useNavigate();

  return (
    // <div className="relative z-10 flex flex-col h-screen pt-6 pb-4  bg-gray-100 ">
    <div className=" min-h-screen lg:pt-[50px] mb-22  bg-white   ">
      <div className="container p-1 mx-auto grid grid-cols-1 md:grid-cols-2   ">
        <div
          id="map"
          ref={mapRef}
          // style={{ height: "350px", width: "100%" }}
          className="relative z-10 flex-1 h-[60vh]  md:h-[120vh] lg:h-[80vh]  rounded-lg shadow-lg bg-gray-100"
          // onClick={onMapClick}
        ></div>
        <div className="col-span-1  shadow-lg rounded-lg p-6">
          <form>
            <div className="flex flex-col p-2 gap-4   w-full">
              <div className="relative">
                <input
                  required
                  type="text"
                  className="border border-gray-200 w-full bg-gray-200 rounded-lg p-2 pr-10  text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter pickup location"
                  value={startLocation}
                  onChange={(e) => {
                    setPickup(e.target.value);
                    fetchSuggestions(e.target.value, "pickup");
                  }}
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
              <div className="relative">
                <input
                  required
                  type="text"
                  className="border bg-gray-200 w-full border-gray-200 rounded-lg p-2 pr-10 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter destination location"
                  value={destinationLocation}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    fetchSuggestions(e.target.value, "destination");
                  }}
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
            <div className="flex px-2 space-x-6  md:mt-0">
              <button
                type="button"
                onClick={findRoute}
                className="bg-blue-600 text-white p-1 rounded-lg transition-transform transform hover:scale-105"
              >
                Find Route
              </button>
              <button
                type="button"
                onClick={resetMap}
                className="bg-red-600 text-white p-1 rounded-lg transition-transform transform hover:scale-105"
              >
                Reset
              </button>
            </div>
            <p className="text-red-500">
              After find route, can also change pickup, destination point and
              route by dragging in map
            </p>
            <div className="flex mt-4 gap-20 justify-center">
              <button
                type="button"
                onClick={()=>{navigate("/")}}
                className="bg-white text-black py-2 px-4 rounded-3xl border-2 border-black hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-transform transform hover:scale-105"
              >
                Back
              </button>

              <button
                type="submit"
                onClick={handleNavigate}
                className="bg-white text-black py-2 px-4 border-2 border-black rounded-3xl hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-transform transform hover:scale-105"
              >
                Save
              </button>
            </div>
          </form>
          {/* {submittedData && 
          <DriverForm data1={pickup} data2={destination}/> */}
        </div>
      </div>
    </div>
  );
};

export default Driver;

// locationService.js

// const socket = io('http://localhost:5000');

// Function to fetch live location data from backend
export const fetchLiveLocation = async () => {
    try {
      const response = await fetch('http://localhost:5000'); // Replace with your backend URL
      if (!response.ok) {
        throw new Error('Failed to fetch live location data');
      }
      const data = await response.json();
      return data; // Assuming the backend returns a location object with latitude and longitude
    } catch (error) {
      console.error('Error fetching live location:', error);
      return null; // Handle error appropriately
    }
  };
  
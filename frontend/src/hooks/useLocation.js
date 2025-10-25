import { useState, useEffect } from "react";

/**
 * useLocation hook
 * Gets live GPS coordinates from the device using the browser's geolocation API.
 */
export const useLocation = () => {
  const [location, setLocation] = useState({ lat: null, lon: null, loading: true, error: null });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({ lat: null, lon: null, loading: false, error: "Geolocation not supported" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          loading: false,
          error: null,
        });
      },
      (err) => {
        setLocation({ lat: null, lon: null, loading: false, error: err.message });
      },
      { enableHighAccuracy: true }
    );
  }, []);

  return location;
};

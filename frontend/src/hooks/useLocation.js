import { useEffect, useState } from "react";

export default function useLocation() {
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords(pos.coords),
      (err) => console.error(err)
    );
  }, []);

  return coords;
}

import { useEffect, useState } from "react";
import api from "../services/api";

export default function useAudioStatus() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/audio/status").then((res) => setData(res.data));
  }, []);

  return data;
}

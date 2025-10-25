import { useEffect, useState } from "react";
import api from "../services/api";

export default function useVisionStatus() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/vision/status").then((res) => setData(res.data));
  }, []);

  return data;
}

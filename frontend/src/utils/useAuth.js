import { useState, useEffect } from "react";

const useAuth = () => {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        const payload = JSON.parse(atob(storedToken.split(".")[1]));
        setCurrentUserId(Number(payload.sub));
        setToken(storedToken);
      } catch (err) {
        console.error("Failed to decode token:", err);
      }
    }
  }, []);

  return { currentUserId, token };
};

export default useAuth;

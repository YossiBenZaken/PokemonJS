import React, { useEffect, useState } from "react";

import Cookies from "js-cookie";
import { Navigate } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

export default function PrivateRoute({ children }: Props) {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const token = Cookies.get("access_token");
    if (!token) {
      setIsAuth(false);
      return;
    }

    setIsAuth(true);
  }, []);

  if (isAuth === null) {
    return <div>Loading...</div>; // בזמן הבדיקה
  }

  return isAuth ? <>{children}</> : <Navigate to="/login" />;
}
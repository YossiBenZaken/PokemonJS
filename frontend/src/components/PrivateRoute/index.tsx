import React, { useEffect, useState } from "react";

import Cookies from "js-cookie";
import { Navigate } from "react-router-dom";
import { useGame } from "../../contexts/GameContext";

type Props = {
  children: React.ReactNode;
  admin?: boolean;
};

export default function PrivateRoute({ children, admin = false }: Props) {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const {selectedCharacter} = useGame();

  useEffect(() => {
    const token = Cookies.get("access_token");
    if (!token) {
      setIsAuth(false);
      return;
    }

    if(admin) {
      setIsAuth(selectedCharacter && selectedCharacter.admin! > 0);
      return;
    }

    setIsAuth(true);
  }, [admin, selectedCharacter]);

  if (isAuth === null) {
    return <div>Loading...</div>; // בזמן הבדיקה
  }

  return isAuth ? <>{children}</> : <Navigate to="/login" />;
}
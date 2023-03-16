import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ Component, ...props }) => {
  return props.isLoggedIn ? <Component {...props} /> : <Navigate to="/login" />;
};

export default ProtectedRoute;

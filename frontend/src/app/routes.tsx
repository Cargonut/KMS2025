import { RouteObject } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
//import LoginPage from "../pages/LoginPage";
//import SignUpPage from "../pages/SignUpPage";
import ImpressumPage from "../pages/ImpressumPage";
import AuthPage from "../pages/AuthPage";

export const routes: RouteObject[] = [
  { path: "/landing", element: <LandingPage /> },
  //{ path: "/login", element: <LoginPage /> },
  //{ path: "/signup", element: <SignUpPage /> },
  { path: "/impressum", element: <ImpressumPage /> },
  { path: "/auth", element: <AuthPage /> },
];

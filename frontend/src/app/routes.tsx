import { RouteObject } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import SignUpPage from "../pages/SignUpPage";
import ImpressumPage from "../pages/ImpressumPage";
import AuthPage from "../pages/AuthPage";
import CenterPage from "../pages/CenterPage";
import DriverMenuPage from "../pages/DriverMenuPage";
import PassengerMenuPage from "../pages/PassengerMenuPage";
import ProfilePage from "../pages/ProfilePage";

export const routes: RouteObject[] = [
  { path: "*", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignUpPage /> },
  { path: "/impressum", element: <ImpressumPage /> },
  { path: "/auth", element: <AuthPage /> },
  { path: "/center", element: <CenterPage /> },
  { path: "/driver-menu", element: <DriverMenuPage /> },
  { path: "/passenger-menu", element: <PassengerMenuPage /> },
  { path: "/profile", element: <ProfilePage /> },
];

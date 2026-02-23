import { RouteObject } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import SignUpPage from "../pages/SignUpPage";
import ImpressumPage from "../pages/ImpressumPage";
import AuthPage from "../pages/AuthPage";
import CenterPage from "../pages/CenterPage";
import DriverMenuPage from "../pages/DriverMenuPage";
import PassengerMenuPage from "../pages/PassengerMenuPage";
import PassengerOverviewPage from "../pages/PassengerOverviewPage";
import ProfilePage from "../pages/ProfilePage";
import TripPublicationPage from "../pages/TripPublicationPage";
import VehicleEditorPage from "../pages/VehicleEditorPage";
import VehiclesPage from "../pages/VehiclesPage";
import MyTripsPage from "../pages/MyTripsPage";
import NearbyDriversPage from "../pages/NearbyDriversPage";

export const routes: RouteObject[] = [
  { path: "*", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignUpPage /> },
  { path: "/impressum", element: <ImpressumPage /> },
  { path: "/auth", element: <AuthPage /> },
  { path: "/center", element: <CenterPage /> },
  { path: "/driver-menu", element: <DriverMenuPage /> },
  { path: "/my-trips", element: <MyTripsPage /> },
  { path: "/nearby-drivers", element: <NearbyDriversPage /> },
  { path: "/trip-publication", element: <TripPublicationPage /> },
  { path: "/vehicle-editor", element: <VehicleEditorPage /> },
  { path: "/vehicles", element: <VehiclesPage /> },
  { path: "/passenger-menu", element: <PassengerMenuPage /> },
  { path: "/passenger-overview", element: <PassengerOverviewPage /> },
  { path: "/profile", element: <ProfilePage /> },
];

import { useRoutes } from "react-router-dom";
import ProfileShortcut from "../components/ProfileShortcut";
import { routes } from "./routes";

export default function App() {
  return (
    <>
      <ProfileShortcut />
      {useRoutes(routes)}
    </>
  );
}

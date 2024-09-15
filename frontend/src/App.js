import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./contexts/AuthContext";
import Authentication from "./pages/authentication";
import HomeComponent from "./pages/home";
import LandingPage from "./pages/landing";

import VideoMeetComponent from "./pages/videoMeet";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* <Route path='/home' element=''></Route> */}
          <Route path="/" element={<LandingPage />}></Route>
          <Route path="/auth" element={<Authentication />}></Route>
          <Route path ='/home' element = {<HomeComponent/>}></Route>
          

          <Route path='/:url' element={<VideoMeetComponent/>}></Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

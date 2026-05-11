import { BrowserRouter, Routes, Route } from "react-router";
import Navbar from "./components/Navbar";
import HeroBanner from "./components/HeroBanner";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HeroBanner />} />
        <Route path="/how-it-works" element={<></>} />
        <Route path="/courses" element={<></>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

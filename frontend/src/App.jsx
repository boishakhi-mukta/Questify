import { BrowserRouter } from "react-router";
import Navbar from "./components/Navbar";
import HeroBanner from "./components/HeroBanner";
import HowItWorks from "./components/HowItWorks";
import CoursesSection from "./components/CoursesSection";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <HeroBanner />
      <HowItWorks />
      <CoursesSection />
    </BrowserRouter>
  );
}

export default App;

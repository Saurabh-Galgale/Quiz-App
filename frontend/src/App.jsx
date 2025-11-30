import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Admin from "./pages/Admin";
import Navbar from "./components/Navbar";

function App() {
  return (
    <div>
      <BrowserRouter>
        {/* NAVBAR ALWAYS ON TOP */}
        <Navbar />

        {/* PAGE CONTENT */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quiz/:id" element={<Quiz />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

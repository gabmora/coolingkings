import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import FrontPage from './components/FrontPage';
import BookingPage from './components/BookingPage';
// import AboutUs from './components/AboutUs'; 
import AC from './components/AC';
import Heating from './components/Heating';
import Header from './Header'; 
import Footer from './Footer';
import './App.css';


function App() {
  return (
    <Router>
        <Header/> 
      <div className="main-content">
        <Routes>
          <Route path="/BookingPage" element={<BookingPage />} />
          <Route path="/Heating" element={<Heating />} />
          <Route path="/AC" element={<AC />} />
          <Route path="/*" element={<FrontPage />} />
        </Routes>
      </div>
        <Footer/>
    </Router>
  );
}

export default App;


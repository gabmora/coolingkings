import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import FrontPage from './components/FrontPage';
import BookingPage from './components/BookingPage';
// import AboutUs from './components/AboutUs'; 
import AC from './components/AC';
import MaintenancePlan from './components/MaintenancePlan';
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
          <Route path="/MaintenancePlan" element={<MaintenancePlan />} />
          <Route path="/AC" element={<AC />} />
          <Route path="/*" element={<FrontPage />} />
        </Routes>
      </div>
      <Footer/> 
    </Router>

  );
}

export default App;


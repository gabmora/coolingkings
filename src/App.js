import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import FrontPage from './components/FrontPage';
import BookingPage from './components/BookingPage';
import AboutUs from './components/AboutUs'; 
import Header from './Header'; 
import Footer from './Footer';
import './App.css';


function App() {
  return (
    <Router>
      <div className="main-content">
        <Header/> 
        <Routes>
          <Route path="/BookingPage" element={<BookingPage />} />
          <Route path="/AboutUs" element={<AboutUs />} />
          <Route path="/*" element={<FrontPage />} />
        </Routes>
      </div>
      <Footer/>
    </Router>
  );
}

export default App;


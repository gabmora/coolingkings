import React from 'react';
import './AboutUs.css';
import heatingImage from './images/heating.jpeg';


function Heating() {
    console.log('Heating component is rendering.');
    return (
        <>
        <img className="frontpageimage" src={heatingImage} alt="Heating" />
        <h5>heating</h5>
        <h1>we fix heat stuff too.</h1>
        
        
        
        </> 
          
    );
}

export default Heating;

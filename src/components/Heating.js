import React from 'react';
import './AboutUs.css';
import heatingImage from './images/heating.jpeg';


function Heating() {
    console.log('Heating component is rendering.');
    return (
        <>
        <h5>heating</h5>
        <h1>we fix heat stuff too.</h1>
        
        <img className="frontpageimage" src={heatingImage} alt="Heating" />
        
        
        </> 
          
    );
}

export default Heating;

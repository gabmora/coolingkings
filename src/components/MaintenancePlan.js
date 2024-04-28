import React from 'react';
import heatingHtml from './heatingHTML'; 

function MaintenancePlan() {
  return (
    <div dangerouslySetInnerHTML={{ __html: heatingHtml }} />
  );
}

export default MaintenancePlan;


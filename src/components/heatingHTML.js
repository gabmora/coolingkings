

export const heatingHtml = `
  <!-- Paste the content of heating.html here -->
  <<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Maintenance Plans - K and E Heating and Air</title>
<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Lato:wght@400;700&family=Oswald:wght@400;700&family=Roboto+Slab:wght@400;700&family=Raleway:wght@400;700&family=Open+Sans:wght@400;700&family=Playfair+Display:wght@400;700&family=Nunito+Sans:wght@400;700&display=swap" rel="stylesheet">
<style>
  body {
    font-family: 'Open Sans', sans-serif;
    background-color: #f8f9fa;
    margin: 0;
    padding: 0;
    color: #333;
  }
  /* Navbar styles */
  .navbar {
    background-color: #07689f; /* Blue */
  }
  .navbar-brand {
    color: #ffffff;
    font-weight: bold;
    font-size: 1.5rem;
  }
  .navbar-nav .nav-link {
    color: #ffffff;
    font-weight: bold;
    margin-right: 20px;
  }
  /* Plan styles */
  .plan {
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-bottom: 20px;
    padding: 20px;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Drop shadow */
    transition: transform 0.3s, box-shadow 0.3s; /* Smooth transition */
    background-image: url('path_to_metallic_texture.jpg'); /* Metallic texture */
    background-repeat: no-repeat; /* Do not repeat the texture */
    background-size: cover; /* Cover the entire background of the plan box */
  }
  .plan:hover {
    transform: translateY(-5px); /* Hover effect */
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2); /* Hover shadow */
  }
  .plan-title {
    font-family: 'Montserrat', sans-serif;
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 10px;
    color: #07689f;
    text-align: center;
    position: relative;
    background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.1) 75%, transparent 75%, transparent); /* Background pattern */
    background-size: 50px 50px; /* Pattern size */
  }
  .plan-title i {
    font-size: 5rem; /* 5 times bigger */
    display: block;
    margin: 0 auto;
    margin-bottom: 20px; /* Space between icon and title */
    color: #555; /* Default color for icons */
    filter: brightness(0.8) saturate(2); /* Metallic effect */
    animation: shine 2s infinite alternate; /* Shining animation */
    transform-origin: center;
  }
  .plan-title i.bronze {
    color: #cd7f32; /* Bronze color */
  }
  .plan-title i.silver {
    color: #c0c0c0; /* Silver color */
  }
  .plan-title i.gold {
    color: #ffd700; /* Gold color */
  }
  @keyframes shine {
    0% {
      opacity: 0.8;
    }
    100% {
      opacity: 1;
    }
  }
  .plan-price {
    font-family: 'Montserrat', sans-serif;
    font-size: 1.2rem;
    font-weight: bold;
    color: #dc3545;
  }
  .plan-description {
    font-family: 'Lato', sans-serif;
    margin-bottom: 20px;
  }
  .plan-features {
    margin-bottom: 20px;
  }
  .plan-feature {
    list-style-type: none;
    padding: 5px 0;
    font-family: 'Open Sans', sans-serif;
  }
  /* Comparison table styles */
  .comparison-table {
    margin-top: 30px;
  }
  .comparison-table table {
    width: 100%;
    border-collapse: collapse;
  }
  .comparison-table th,
  .comparison-table td {
    padding: 10px;
    border: 1px solid #ccc;
    text-align: center;
  }
  .comparison-table th {
    background-color: #f8f9fa;
    font-weight: bold;
  }
  .comparison-table td:first-child {
    text-align: left;
    font-weight: bold;
  }
  
</style>
</head>
<body>


<!-- Main Content -->
<div class="container content">
    <div class="row">
      <div class="col-md-12 text-center mt-4">
        <h1 style="font-family: 'Oswald', sans-serif;">Maintenance Plans</h1>
      </div>
    </div>
    <div class="row">
      <div class="col-md-4">
        <div class="plan">
          <div class="plan-title"><i class="fas fa-wrench fa-5x bronze"></i> Essential Maintenance Plan</div>
          <div class="plan-price">$150/year</div>
          <div class="plan-description">Our essential maintenance plan includes:</div>
          <div class="plan-features">
            <ul>
              <li class="plan-feature"><i class="fas fa-check-circle"></i> Seasonal tune-up and inspection (1 visit per year)</li>
              <li class="plan-feature"><i class="fas fa-check-circle"></i> Priority scheduling for service calls</li>
              <li class="plan-feature"><i class="fas fa-check-circle"></i> 10% discount on repairs</li>
              <li class="plan-feature"><i class="fas fa-check-circle"></i> Reminder service for scheduling maintenance</li>
              <li class="plan-feature"><i class="fas fa-check-circle"></i> Technician will perform various checks and inspections</li>
            </ul>
          </div>

        </div>
      </div>
      <div class="col-md-4">
        <div class="plan">
          <div class="plan-title"><i class="fas fa-tools fa-5x silver"></i> Advanced Maintenance Plan</div>
          <div class="plan-price">$250/year</div>
          <div class="plan-description">Our advanced maintenance plan includes all services in the Essential Maintenance Plan, plus:</div>
          <div class="plan-features">
            <ul>
              <li class="plan-feature"><i class="fas fa-check-circle"></i> Seasonal tune-up and inspection (2 visits per year)</li>
              <li class="plan-feature"><i class="fas fa-check-circle"></i> Priority scheduling for service calls</li>
              <li class="plan-feature"><i class="fas fa-check-circle"></i> 15% discount on repairs</li>
              <li class="plan-feature"><i class="fas fa-check-circle"></i> No overtime charges for after-hours service</li>
              <li class="plan-feature"><i class="fas fa-check-circle"></i> Reminder service for scheduling maintenance</li>
              <li class="plan-feature"><i class="fas fa-check-circle"></i> Additional checks and inspections by the technician</li>
            </ul>
          </div>
          
        </div>
      </div>
      <div class="col-md-4">
        <div class="plan">
          <div class="plan-title"><i class="fas fa-shield-alt fa-5x gold"></i> Premium Maintenance Plan</div>
          <div class="plan-price">$350/year</div>
          <div class="plan-description">Our premium maintenance plan includes all services in the Advanced Maintenance Plan, plus:</div>
          <div class="plan-features">
            <ul>
              <li class="plan-feature"><i class="fas fa-check-circle"></i> Seasonal tune-up and inspection (2 visits per year)</li>
              <li class="plan-feature"><i class="fas fa-check-circle"></i> Priority scheduling for service calls</li>
              <li class="plan-feature"><i class="fas fa-check-circle"></i> 20% discount on repairs</li>
              <li class="plan-feature"><i class="fas fa-check-circle"></i> No overtime charges for after-hours service</li>
              <li class="plan-feature"><i class="fas fa-check-circle"></i> Reminder service for scheduling maintenance</li>
              <li class="plan-feature"><i class="fas fa-check-circle"></i> Comprehensive checks and inspections by the technician</li>
              <li class="plan-feature"><i class="fas fa-check-circle"></i> Priority status for emergency service calls</li>
            </ul>
          </div>
          
        </div>
      </div>
    </div>
  </div>
  
  <!-- Comparison Table -->
  <div class="container comparison-table">
    <div class="row">
      <div class="col-md-12">
        <h2 class="text-center mb-4" style="font-family: 'Oswald', sans-serif;">Plan Comparison</h2>
        <table class="table table-bordered">
          <thead>
            <tr>
              <th style="font-family: 'Montserrat', sans-serif;">Feature</th>
              <th style="font-family: 'Montserrat', sans-serif;">Essential Plan</th>
              <th style="font-family: 'Montserrat', sans-serif;">Advanced Plan</th>
              <th style="font-family: 'Montserrat', sans-serif;">Premium Plan</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="font-family: 'Lato', sans-serif;"><i class="fas fa-wrench"></i> Maintenance Services</td>
              <td><i class="fas fa-check text-success"></i> Annual Tune-up</td>
              <td><i class="fas fa-check text-success"></i> Bi-Annual Tune-up</td>
              <td><i class="fas fa-check text-success"></i> Bi-Annual Tune-up</td>
            </tr>
            <tr>
              <td style="font-family: 'Lato', sans-serif;"><i class="fas fa-phone-alt"></i> Service Response Time</td>
              <td>24-48 hours</td>
              <td>12-24 hours</td>
              <td>6-12 hours</td>
            </tr>
            <tr>
              <td style="font-family: 'Lato', sans-serif;"><i class="fas fa-percent"></i> Repair Discount</td>
              <td>10%</td>
              <td>15%</td>
              <td>20%</td>
            </tr>
            <tr>
              <td style="font-family: 'Lato', sans-serif;"><i class="fas fa-shield-alt"></i> Equipment Coverage</td>
              <td>Not Included</td>
              <td>Basic Components</td>
              <td>Comprehensive Coverage</td>
            </tr>
            <tr>
              <td style="font-family: 'Lato', sans-serif;"><i class="fas fa-user-check"></i> Customer Support</td>
              <td>Standard Hours</td>
              <td>Extended Hours</td>
              <td>24/7 Support</td>
            </tr>
            <tr>
              <td style="font-family: 'Lato', sans-serif;"><i class="fas fa-exclamation-circle"></i> Emergency Service</td>
              <td></td>
              <td><i class="fas fa-check text-success"></i></td>
              <td><i class="fas fa-check text-success"></i></td>
            </tr>
          </tbody>
        </table>
        <p class="text-center"><a href="#" class="btn btn-primary">Choose Your Plan</a></p>
      </div>
    </div>
  </div>
  
  `;

  
export default heatingHtml;



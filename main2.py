<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://pyscript.net/releases/2024.1.1/core.css">
  <script type="module" src="https://pyscript.net/releases/2024.1.1/core.js"></script>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" rel="stylesheet">
  <title>School Club Information</title>
  <style>
    body { background-color: #f8f9fa; padding: 20px; }
    .club-info { margin-top: 20px; padding: 15px; background: #ffffff; border-radius: 8px; box-shadow: 0px 2px 6px rgba(0,0,0,0.1); }
  </style>
</head>
<body>
  <div class="container">
    <h1 class="text-center mb-4">OBMC Highschool Clubs</h1>
    
    <!-- Dropdown menu -->
    <div class="dropdown">
      <button class="btn btn-primary dropdown-toggle" type="button" id="clubDropdown" data-bs-toggle="dropdown" aria-expanded="false">
        Select a Club
      </button>
      <ul class="dropdown-menu" aria-labelledby="clubDropdown">
        <li><a class="dropdown-item" href="#" py-click="show_club('Glee Club')">Glee Club</a></li>
        <li><a class="dropdown-item" href="#" py-click="show_club('Math Club')">Math Club</a></li>
        <li><a class="dropdown-item" href="#" py-click="show_club('Communication Arts Club')">Communication Arts Club</a></li>
        <li><a class="dropdown-item" href="#" py-click="show_club('Marching Band')">Marching Band</a></li>
        <li><a class="dropdown-item" href="#" py-click="show_club('Dance Club')">Dance Club</a></li>
        <li><a class="dropdown-item" href="#" py-click="show_club('Science Club')">Science Club</a></li>
      </ul>
    </div>

    <!-- Club info display -->
    <div id="clubInfo" class="club-info">
      <p>Select a club to see the details.</p>
    </div>
  </div>

  <!-- Link Python Script -->
  <script type="py" src="main3.py"></script>
</body>
</html>
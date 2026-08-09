// app.js - Main Application Controller

document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI components
  window.UI.init();
  
  // Initialize Charts
  window.Charts.init();

  // Tab Navigation Logic
  const navItems = document.querySelectorAll('.nav-item');
  const views = document.querySelectorAll('.view');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove active class from all nav items
      navItems.forEach(nav => nav.classList.remove('active'));
      // Add active class to clicked item
      item.classList.add('active');

      // Hide all views
      views.forEach(view => view.classList.remove('active'));
      
      // Show corresponding view
      const targetViewId = item.getAttribute('data-target');
      const targetView = document.getElementById(targetViewId);
      if (targetView) {
        targetView.classList.add('active');
      }
    });
  });
});

// Handle page transitions on navigation
document.addEventListener('DOMContentLoaded', function() {
  // Get all navigation links
  const navLinks = document.querySelectorAll('nav a');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Only handle internal links
      const href = this.getAttribute('href');
      if (href === 'index.html' || href === 'timetable.html' || href === 'contact.html' || href === 'images.html' || href === 'create-timetable.html') {
        e.preventDefault(); // Prevent the default link behavior
        
        // Add fade-out class to body
        document.body.classList.add('fade-out');
        
        // Wait for the fade-out animation to complete
        setTimeout(() => {
          window.location.href = href; // Navigate to the new page
        }, 100);
      }
    });
  });
});


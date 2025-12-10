// Initialize Glide carousel
document.addEventListener('DOMContentLoaded', function() {
  new Glide('.glide', {
    type: 'carousel',
    startAt: 0,
    perView: 1,
    gap: 0,
    autoplay: 3000,
    hoverpause: true
  }).mount();
});


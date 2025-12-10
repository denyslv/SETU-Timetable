// Image rollover and replacement effects
document.addEventListener('DOMContentLoaded', function() {
  // Image rollover effects
  const rolloverImages = document.querySelectorAll('.rollover-image');
  rolloverImages.forEach(img => {
    const originalSrc = img.src;
    const hoverSrc = img.getAttribute('data-hover') || originalSrc;
    
    img.addEventListener('mouseenter', function() {
      this.style.filter = 'brightness(1.2) saturate(1.2)';
      this.style.transform = 'scale(1.15) rotate(5deg)';
    });
    
    img.addEventListener('mouseleave', function() {
      this.style.filter = '';
      this.style.transform = '';
    });
  });

  // Image replacement functionality
  const replaceableImages = document.querySelectorAll('.replaceable-image');
  replaceableImages.forEach(img => {
    img.addEventListener('click', function() {
      const replaceSrc = this.getAttribute('data-replace');
      if (replaceSrc) {
        // Animate replacement
        this.style.opacity = '0';
        this.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
          this.src = replaceSrc;
          // Swap the data-replace attribute with another image
          const otherImages = document.querySelectorAll('.replaceable-image');
          otherImages.forEach(otherImg => {
            if (otherImg !== this && otherImg.getAttribute('data-replace') === this.src) {
              otherImg.setAttribute('data-replace', this.getAttribute('data-replace'));
              this.setAttribute('data-replace', otherImg.src);
            }
          });
          
          this.style.opacity = '1';
          this.style.transform = 'scale(1)';
        }, 200);
      }
    });
  });
});


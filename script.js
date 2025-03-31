document.addEventListener('DOMContentLoaded', () => {
    fetch('images.txt')
        .then(response => response.text())
        .then(data => {
            const images = data.split('\n').map(line => {
                const [url, altText, link] = line.split(',');
                return { url, altText, link };
            });

            const carouselContainer = document.getElementById('carousel-container');
            let currentIndex = 0;
            const imagesPerView = 3; // Number of images to display at a time

            // Populate carousel with images
            images.forEach(image => {
                const anchor = document.createElement('a');
                anchor.href = image.link;
                const img = document.createElement('img');
                img.src = image.url;
                img.alt = image.altText;
                anchor.appendChild(img);
                carouselContainer.appendChild(anchor);
            });

            // Function to update the carousel position
            function updateCarousel() {
                const offset = -currentIndex * (100 / imagesPerView); // Calculate offset based on current index
                carouselContainer.style.transform = `translateX(${offset}%)`; // Move carousel
            }

            // Event listeners for buttons
            document.getElementById('prev-button').addEventListener('click', () => {
                if (currentIndex > 0) {
                    currentIndex--;
                    updateCarousel();
                }
            });

            document.getElementById('next-button').addEventListener('click', () => {
                if (currentIndex < images.length - imagesPerView) {
                    currentIndex++;
                    updateCarousel();
                }
            });
        })
        .catch(error => console.error('Error loading images:', error));
});

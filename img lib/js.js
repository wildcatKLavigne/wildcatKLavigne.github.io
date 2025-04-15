window.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM Content Loaded');
    
    // Fetch data from data.json
    let data;
    try {
        const response = await fetch('data.json');
        data = await response.json();
        console.log('Data loaded from data.json:', data);
    } catch (error) {
        console.error('Error loading data:', error);
        return;
    }
    
    // Populate navbar
    const navbarContainer = document.getElementById('navbar-container');
    console.log('Navbar container:', navbarContainer);
    
    if (data.navbar && data.navbar.length > 0) {
        data.navbar.forEach(item => {
            const button = document.createElement('button');
            button.className = 'btn btn-outline-success mr-2';
            button.type = 'button';
            button.textContent = item.text;
            navbarContainer.appendChild(button);
        });
    }

    // Set portrait
    const portrait = document.getElementById('portrait');
    console.log('Portrait element:', portrait);
    
    if (data.portrait) {
        portrait.src = data.portrait.src;
        portrait.alt = data.portrait.alt;
        console.log('Portrait set to:', data.portrait.src);
    }

    // Populate portfolio
    const portfolioContainer = document.getElementById('portfolio-container');
    console.log('Portfolio container:', portfolioContainer);
    
    if (data.portfolio && data.portfolio.length > 0) {
        data.portfolio.forEach(item => {
            const img = document.createElement('img');
            img.className = 'img';
            img.src = item.src;
            img.alt = item.alt;
            portfolioContainer.appendChild(img);
            console.log('Added portfolio image:', item.src);
        });
    }

    // Set about text
    const textContainer = document.getElementById('text');
    console.log('Text container:', textContainer);
    
    if (data.about && data.about.text) {
        const paragraph = document.createElement('p');
        paragraph.textContent = data.about.text;
        textContainer.appendChild(paragraph);
        console.log('About text set');
    }

    // Apply the original layout logic
    let allImages = [...document.querySelectorAll('.img')].filter(img => img.id !== 'portrait');
    console.log('All images found:', allImages.length);
    
    if (allImages.length > 0) {
        let mainBody = document.getElementById('main-body');
        console.log('Main body element:', mainBody);

        let mainBodyRect = mainBody.getBoundingClientRect();
        let mainBodyHeight = mainBodyRect.height;
        let topOffset = mainBodyRect.top + window.scrollY;

        let imageHeight = allImages[0].offsetHeight;
        let portraitHeight = portrait.offsetHeight;

        portrait.style.top = topOffset + (mainBodyHeight - portraitHeight) / 2 + 'px';

        let stAngle = -allImages.length * 8;
        let endAngl = allImages.length * 8;

        let stPos = topOffset + mainBodyHeight / 2 - imageHeight - 100;
        let endPos = topOffset + mainBodyHeight / 2 + imageHeight - 100;

        allImages.forEach((img, index) => {
            let rotation = stAngle + (index * (endAngl - stAngle) / (allImages.length - 1));
            let position = stPos + (index * (endPos - stPos) / (allImages.length - 1));

            img.style.top = position + 'px';
            img.style.left = '11rem';
            img.style.rotate = rotation + 'deg';
        });

        let incport = [...allImages, portrait];

        allImages.forEach(img => {
            img.addEventListener('click', () => {
                console.log('clicked');
                // let carousel = document.getElementById('carouselExampleDark');
                // carousel.classList.remove('hidden-el');
                // document.getElementById('background').style.visibility = 'visible';
            });
        });

        let portraitTop = portrait.getBoundingClientRect().top + window.scrollY;
        let mainBodyTop = mainBody.getBoundingClientRect().top + window.scrollY;
        let distanceFromMainBodyTop = portraitTop - mainBodyTop;

        portrait.addEventListener('click', () => {
            allImages.forEach((img, index) => {
                console.log('clicked port');
                img.style.position = 'static';
                img.style.rotate = '0deg';
                img.style.marginLeft = '2rem';
                img.style.marginBottom = '2rem';
            });

            let flexbox = document.querySelector('.flexbox');
            flexbox.style.height = 'min-content';
            flexbox.style.marginTop = distanceFromMainBodyTop + 'px';
            document.querySelector('.my-container').style.width = 'inherit';

            let text = document.getElementById('text');
            text.style.marginTop = '3rem';
            text.style.maxWidth = '40rem';
            text.style.marginLeft = 'auto';
            text.style.marginRight = 'auto';
        });
    } else {
        console.error('No images found to apply layout');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Namespace for the application
    const app = {
        init: () => {
            app.toggleMobileMenu();
            app.handleFormSubmissions();
        },

        toggleMobileMenu: () => {
            const mobileMenuButton = document.querySelector('[data-collapse-toggle="mobile-menu"]');
            const mobileMenu = document.getElementById('mobile-menu');

            if (mobileMenuButton) {
                mobileMenuButton.addEventListener('click', () => {
                    mobileMenu.classList.toggle('hidden');
                });
            }
        },

        handleFormSubmissions: () => {
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                form.addEventListener('submit', async (event) => {
                    event.preventDefault();
                    const formData = new FormData(form);
                    const action = form.getAttribute('action');
                    const method = form.getAttribute('method').toUpperCase();

                    try {
                        const response = await fetch(action, {
                            method: method,
                            body: method === 'POST' ? JSON.stringify(Object.fromEntries(formData)) : null,
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        });

                        if (response.ok) {
                            const data = await response.json();
                            app.handleDownload(data);
                        } else {
                            console.error('Error:', response.statusText);
                        }
                    } catch (error) {
                        console.error('Error:', error);
                    }
                });
            });
        },

        handleDownload: (data) => {
            if (data && data.file_url && data.file_name) {
                const downloadLink = document.createElement('a');
                downloadLink.href = data.file_url;
                downloadLink.download = data.file_name;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            } else {
                console.error('Invalid download data');
            }
        }
    };

    // Function to handle the video conversion process
    function handleVideoConversion(endpoint) {
        const convertBtn = document.getElementById('convertBtn');
        const downloadForm = document.getElementById('downloadForm');
        const downloadMessage = document.getElementById('downloadMessage');
        
        convertBtn.addEventListener('click', () => {
            const videoUrl = document.getElementById('video_url').value;
            fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ video_url: videoUrl })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to convert/download the video.');
                }
                return response.json();
            })
            .then(data => {
                downloadMessage.innerHTML = `<p class="text-green-500">Download successful! <a href="${data.file_url}" class="underline">Download link</a></p>`;
                downloadMessage.classList.remove('hidden');
            })
            .catch(error => {
                console.error('Error:', error);
                downloadMessage.innerHTML = `<p class="text-red-500">${error.message}</p>`;
                downloadMessage.classList.remove('hidden');
            });
        });
    }

    // Initialize the application
    app.init();

    // Extract the platform information from the URL and call handleVideoConversion accordingly
    const currentPage = window.location.pathname.split('/').pop();
    switch (currentPage) {
        case 'youtube-to-mp3.html':
            handleVideoConversion('/api/youtube/mp3');
            break;
        case 'YouTube-to-MP4.html':
            handleVideoConversion('/api/youtube/mp4');
            break;
        case 'instagram.html':
            handleVideoConversion('/api/instagram');
            break;
        case 'instagram-reels.html':
            handleVideoConversion('/api/instagram/reels');
            break;
        case 'facebook.html':
            handleVideoConversion('/api/facebook');
            break;
        case 'twitter.html':
            handleVideoConversion('/api/twitter');
            break;
        case 'faq.html':
            // No need to handle conversion for FAQ page
            break;
        default:
            console.error('Unsupported page:', currentPage);
    }
});

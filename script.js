document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.querySelector('[data-collapse-toggle="mobile-menu"]');
    const menu = document.querySelector('#mobile-menu');

    toggleButton.addEventListener('click', () => {
        menu.classList.toggle('hidden'); // Toggle the 'hidden' class
    });
});

// 1. General initialization (excluding special interactive tooltip)
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]:not(#interactive-tooltip)')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

document.addEventListener('DOMContentLoaded', function () {
    const triggerEl = document.getElementById('interactive-tooltip');
    if (!triggerEl) return;

    // 2. Initialize the interactive tooltip manually
    const tooltip = new bootstrap.Tooltip(triggerEl, {
        html: true,
        trigger: 'manual', 
        sanitize: false 
    });

    let timer;

    function showTooltip() {
        clearTimeout(timer);
        tooltip.show();
        
        // Use a slight timeout to ensure the DOM element exists before grabbing it
        setTimeout(() => {
            const tooltipEl = document.querySelector('.tooltip'); 
            if (tooltipEl) {
                tooltipEl.addEventListener('mouseenter', () => clearTimeout(timer));
                tooltipEl.addEventListener('mouseleave', hideTooltip);
            }
        }, 10);
    }

    function hideTooltip() {
        timer = setTimeout(() => {
            tooltip.hide();
        }, 300); // Increased slightly for better "bridge" feel
    }

    triggerEl.addEventListener('mouseenter', showTooltip);
    triggerEl.addEventListener('mouseleave', hideTooltip);
});
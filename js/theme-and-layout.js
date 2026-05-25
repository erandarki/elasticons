document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_THEME = 'bsTheme';
  const STORAGE_LAYOUT = 'layout-style';

  /* -------------------------------------------------------------------------- */
  /* Theme Logic                                                                */
  /* -------------------------------------------------------------------------- */
  const themeInput = document.getElementById('bs-theme');
  const themeLabel = document.querySelector('.color-switch-btn');
  const themeIcon = themeLabel.querySelector('use');
  const themeTooltip = new bootstrap.Tooltip(themeLabel);

  const updateThemeUI = (theme) => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    themeInput.checked = (theme === 'dark');
    themeIcon.setAttribute('href', theme === 'dark' ? '#light' : '#dark');
    themeTooltip.setContent({ '.tooltip-inner': theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode' });
  };

  themeInput.addEventListener('change', () => {
    const newTheme = themeInput.checked ? 'dark' : 'light';
    localStorage.setItem(STORAGE_THEME, newTheme);
    updateThemeUI(newTheme);
  });

  /* -------------------------------------------------------------------------- */
  /* Layout Logic                                                               */
  /* -------------------------------------------------------------------------- */
  const layoutInput = document.getElementById('container-layout');
  const layoutLabel = document.querySelector('.container-layout-btn');
  const layoutIcon = layoutLabel.querySelector('use');
  const layoutTooltip = new bootstrap.Tooltip(layoutLabel);

  const updateLayoutUI = (isFluid) => {
    const containers = document.querySelectorAll('.container, .container-fluid');
    containers.forEach(el => {
      if (isFluid) {
        el.classList.replace('container', 'container-fluid');
      } else {
        el.classList.replace('container-fluid', 'container');
      }
    });

    layoutInput.checked = isFluid;
    layoutIcon.setAttribute('href', isFluid ? '#condense' : '#expand');
    layoutTooltip.setContent({ '.tooltip-inner': isFluid ? 'Condense layout' : 'Expand layout' });
    
    // Remove the temporary head style if it exists
    const tempFix = document.getElementById('temp-layout-fix');
    if (tempFix) tempFix.remove();
  };

  layoutInput.addEventListener('change', () => {
    const isFluid = layoutInput.checked;
    localStorage.setItem(STORAGE_LAYOUT, isFluid ? 'fluid' : 'fixed');
    updateLayoutUI(isFluid);
  });

  /* -------------------------------------------------------------------------- */
  /* Initialize UI State                                                        */
  /* -------------------------------------------------------------------------- */
  const currentTheme = localStorage.getItem(STORAGE_THEME) || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const currentLayout = localStorage.getItem(STORAGE_LAYOUT) !== 'fixed'; // defaults to true

  updateThemeUI(currentTheme);
  updateLayoutUI(currentLayout);
  
  // Sync with System Theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_THEME)) {
      updateThemeUI(e.matches ? 'dark' : 'light');
    }
  });

  // Wait until the next "frame" to enable transitions.
  // This prevents the animation from firing on the very first render.
  // requestAnimationFrame(() => {
  //   setTimeout(() => {
  //     document.querySelectorAll('.container, .container-fluid').forEach(el => el.classList.add('transition-layout')); // Add transition class for smooth effect
  //   }, 100); 
  // });
});
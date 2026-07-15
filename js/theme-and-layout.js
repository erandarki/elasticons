document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_THEME = 'bsTheme';
  const STORAGE_LAYOUT = 'layout-style';

  /* -------------------------------------------------------------------------- */
  /* Theme Logic                                                                */
  /* -------------------------------------------------------------------------- */
  const themeInput = document.getElementById('bs-theme');
  const themeLabel = document.querySelector('.color-switch-btn');
  const iconLight = document.querySelector('.icon-light');
  const iconDark = document.querySelector('.icon-dark');
  const themeTooltip = new bootstrap.Tooltip(themeLabel);

  const updateThemeUI = (theme) => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    themeInput.checked = (theme === 'dark');
    
    // Toggle the d-none class to show the correct icon
    if (theme === 'dark') {
      iconDark.classList.add('d-none');
      iconLight.classList.remove('d-none'); // Show Sun to switch back to light
    } else {
      iconLight.classList.add('d-none');
      iconDark.classList.remove('d-none'); // Show Moon to switch back to dark
    }

    themeTooltip.setContent({ '.tooltip-inner': theme === 'dark' ? 'Switch to light' : 'Switch to dark' });
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
  const iconCondense = document.querySelector('.icon-condense');
  const iconExpand = document.querySelector('.icon-expand');
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
    
    // Toggle the d-none class to show the correct icon
    if (isFluid) {
      // If layout is fluid, show the "condense" icon to allow switching back
      iconExpand.classList.add('d-none');
      if (iconCondense) iconCondense.classList.remove('d-none'); 
    } else {
      // If layout is fixed, show the "expand" icon to allow switching back
      if (iconCondense) iconCondense.classList.add('d-none');
      iconExpand.classList.remove('d-none'); 
    }

    layoutTooltip.setContent({ '.tooltip-inner': isFluid ? 'Condense view' : 'Expand view' });
    
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
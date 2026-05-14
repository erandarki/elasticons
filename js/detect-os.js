function updateSearchHint() {
  const hintElement = document.getElementById('search-shortcut-hint');
  
  // 1. Check the modern API first (Chrome, Edge, Opera)
  const platform = navigator.userAgentData?.platform || navigator.userAgent;
  
  // 2. Look for Mac/iPhone/iPad in the string
  const isApple = /Mac|iPhone|iPad|iPod/i.test(platform);

  // 3. Update the hint text accordingly
  hintElement.textContent = isApple ? '⌘ K' : 'Ctrl K';
}

updateSearchHint();
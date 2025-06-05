export function enableLazyLoading() {
  const setLazy = (img) => {
    if (img && !img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
  };

  document.querySelectorAll('img').forEach(setLazy);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node.tagName === 'IMG') {
          setLazy(node);
        } else if (node.querySelectorAll) {
          node.querySelectorAll('img').forEach(setLazy);
        }
      });
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function injectScript(file, node) {
    var th = document.getElementsByTagName(node)[0];
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    th.appendChild(s);
}

injectScript(chrome.runtime.getURL('injected.js'), 'body');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateChart") {
    window.postMessage({ type: "updateLiveData", data: request.data }, '*');
  } else if (request.action === "aiResults") {
    window.postMessage({ type: "aiOptimizationComplete", data: request.data }, '*');
  }
});

// Mutation observer for dynamic content
function observeMutations() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Here you might want to re-inject scripts or update the UI based on new content
          }
        });
      }
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

observeMutations();

let aiRunning = false;

self.onmessage = function(e) {
  if (e.data.action === 'runAI') {
    if (!aiRunning) {
      aiRunning = true;
      runAIOptimization(e.data.strategies, e.data.model);
    }
  } else if (e.data.action === 'stopAI') {
    aiRunning = false;
  }
};

function runAIOptimization(strategies, model) {
  // Simulate AI optimization process
  let results = [];
  let interval = setInterval(() => {
    if (!aiRunning) {
      clearInterval(interval);
      return;
    }
    
    strategies.forEach(strategy => {
      results.push({
        name: strategy.name,
        score: Math.random() * 100 // Simulate performance scoring
      });
    });

    if (results.length >= strategies.length * 5) { // Just for demonstration
      aiRunning = false;
      clearInterval(interval);
      self.postMessage({ action: 'aiResults', data: { strategies: results } });
    }
  }, 1000); // Simulate some delay in AI processing
}

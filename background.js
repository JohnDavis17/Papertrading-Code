// Web worker for data processing
const liveDataWorker = new Worker('worker.js');
const aiWorker = new Worker('aiWorker.js');

// WebSocket for real-time data
let ws;

chrome.runtime.onInstalled.addListener(() => {
  console.log("Photon Ultra Advanced Paper Trading extension installed");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startLiveData") {
    if (!ws) {
      ws = new WebSocket('wss://api.photontrading.com/realtime');
      ws.onmessage = function(event) {
        liveDataWorker.postMessage({ action: 'processData', data: JSON.parse(event.data) });
      };
      ws.onopen = function() {
        console.log('WebSocket Connected');
      };
      ws.onerror = function(error) {
        console.error('WebSocket Error:', error);
      };
    }
  } else if (request.action === "runAI") {
    aiWorker.postMessage({ action: 'runAI', strategies: getStrategies(), model: request.model });
    sendResponse({ success: true, data: {} }); // Placeholder response
    return true; // Indicates async response
  } else if (request.action === "stopAI") {
    aiWorker.postMessage({ action: 'stopAI' });
  } else if (request.action === "backtest") {
    backtestStrategy(request.strategyId, sendResponse);
    return true;
  } else if (request.action === "generateReport") {
    generateReport(sendResponse);
    return true;
  }
});

function getStrategies() {
  // Fetch strategies from storage or simulate fetching from API
  return [
    { id: "1", name: "Mean Reversion", parameters: { period: 20, threshold: 0.02 } },
    { id: "2", name: "Momentum", parameters: { lookback: 10, threshold: 0.05 } }
  ];
}

async function backtestStrategy(strategyId, callback) {
  // Simulate backtesting logic
  const result = await new Promise(resolve => setTimeout(() => resolve({
    strategyId: strategyId,
    performance: Math.random() * 100
  }), 2000));
  callback({ success: true, data: result });
}

async function generateReport(callback) {
  // Simulate report generation
  const report = await new Promise(resolve => setTimeout(() => resolve({
    id: Date.now().toString(),
    name: `Report ${Date.now()}`,
    data: {
      dates: ['2023-01-01', '2023-02-01', '2023-03-01'],
      performance: [10, 20, 15]
    }
  }), 2000));
  callback(report);
}

liveDataWorker.onmessage = function(e) {
  if (e.data.action === 'dataProcessed') {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "updateChart", data: e.data.data });
    });
  }
};

aiWorker.onmessage = function(e) {
  if (e.data.action === 'aiResults') {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "aiResults", data: e.data.data });
    });
  }
};

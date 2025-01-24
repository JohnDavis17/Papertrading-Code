self.onmessage = function(e) {
  if (e.data.action === 'processData') {
    const processedData = processLiveData(e.data.data);
    self.postMessage({ action: 'dataProcessed', data: processedData });
  }
};

function processLiveData(data) {
  // Perform complex data processing here
  return {
    timestamp: data.timestamp,
    price: data.price,
    volume: data.volume,
    lastTrade: data.lastTrade
  };
}

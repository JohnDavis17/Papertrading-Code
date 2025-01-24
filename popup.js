document.addEventListener('DOMContentLoaded', async function() {
  const buttons = {
    dashboard: document.getElementById('dashboardBtn'),
    strategy: document.getElementById('strategyBtn'),
    ai: document.getElementById('aiBtn'),
    reports: document.getElementById('reportsBtn'),
    settings: document.getElementById('settingsBtn'),
    logout: document.getElementById('logoutBtn')
  };
  const statusDiv = document.getElementById('status');
  const userInfoDiv = document.getElementById('userInfo');
  const serverStatusDiv = document.getElementById('serverStatus');
  const mainContent = document.getElementById('mainContent');

  // Fetch user info and server status
  const userInfo = await getUserInfo();
  const serverStatus = await getServerStatus();
  updateUserInfo(userInfo);
  updateServerStatus(serverStatus);

  // Event listeners for navigation
  buttons.dashboard.addEventListener('click', () => showSection('tradingView'));
  buttons.strategy.addEventListener('click', () => showSection('strategyManagement'));
  buttons.ai.addEventListener('click', () => showSection('aiOptimization'));
  buttons.reports.addEventListener('click', () => showSection('reports'));
  buttons.settings.addEventListener('click', () => showSection('settings'));
  buttons.logout.addEventListener('click', logout);

  // Show initial dashboard
  showSection('tradingView');

  // Function to switch content sections
  function showSection(sectionId) {
    Array.from(mainContent.children).forEach(child => child.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
  }

  async function getUserInfo() {
    const token = await chrome.identity.getAuthToken({ interactive: true });
    if (token) {
      const profile = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then(res => res.json());
      return profile;
    }
    return null;
  }

  function updateUserInfo(info) {
    if (info) {
      userInfoDiv.textContent = `Logged in as: ${info.email}`;
    } else {
      userInfoDiv.textContent = 'Not logged in';
    }
  }

  async function getServerStatus() {
    const response = await fetch('https://api.photontrading.com/status');
    return response.json();
  }

  function updateServerStatus(status) {
    serverStatusDiv.textContent = `Server: ${status.online ? 'Online' : 'Offline'}`;
    serverStatusDiv.style.color = status.online ? 'green' : 'red';
  }

  async function logout() {
    await chrome.identity.removeCachedAuthToken({ token: await chrome.identity.getAuthToken({ interactive: false }) });
    chrome.storage.local.remove('photonAuth');
    statusDiv.textContent = 'Logged out';
    updateUserInfo(null);
  }

  // Live data streaming setup
  const liveChart = new Chart(document.getElementById('liveChart'), {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Live Price',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        x: { type: 'realtime', realtime: { duration: 20000, refresh: 1000 } },
        y: { beginAtZero: true }
      }
    }
  });

  chrome.runtime.sendMessage({ action: "startLiveData" });
  
  // Strategy management
  setupStrategyManagement();
  
  // AI Optimization setup
  setupAIOptimization();
  
  // Reports functionality
  setupReports();
  
  // Settings configuration
  setupSettings();
});

function setupStrategyManagement() {
  const strategyList = document.getElementById('strategyList');
  const newStrategyButton = document.getElementById('newStrategy');
  const editStrategyButton = document.getElementById('editStrategy');
  const backtestButton = document.getElementById('backtestStrategy');

  newStrategyButton.addEventListener('click', () => {
    chrome.tabs.create({ url: 'chrome-extension://' + chrome.runtime.id + '/newStrategy.html' });
  });

  editStrategyButton.addEventListener('click', () => {
    const selectedStrategy = strategyList.querySelector('.selected');
    if (selectedStrategy) {
      chrome.tabs.create({ url: 'chrome-extension://' + chrome.runtime.id + '/editStrategy.html?id=' + selectedStrategy.dataset.id });
    } else {
      alert('Please select a strategy to edit.');
    }
  });

  backtestButton.addEventListener('click', async () => {
    const selectedStrategy = strategyList.querySelector('.selected');
    if (selectedStrategy) {
      const backtestResults = await chrome.runtime.sendMessage({ action: "backtest", strategyId: selectedStrategy.dataset.id });
      alert(JSON.stringify(backtestResults, null, 2));
    } else {
      alert('Please select a strategy to backtest.');
    }
  });

  chrome.storage.local.get('strategies', ({ strategies }) => {
    if (strategies) {
      strategies.forEach(strategy => {
        let item = document.createElement('div');
        item.textContent = strategy.name;
        item.dataset.id = strategy.id;
        item.addEventListener('click', () => toggleSelection(item));
        strategyList.appendChild(item);
      });
    }
  });

  function toggleSelection(element) {
    Array.from(strategyList.children).forEach(child => child.classList.remove('selected'));
    element.classList.add('selected');
  }
}

function setupAIOptimization() {
  const aiStatus = document.getElementById('aiStatus');
  const runAIButton = document.getElementById('runAI');
  const stopAIButton = document.getElementById('stopAI');
  const aiModelSelect = document.getElementById('aiModelSelect');
  const aiPerformanceChart = document.getElementById('aiPerformanceChart');
  const aiResults = document.getElementById('aiResults');

  runAIButton.addEventListener('click', async () => {
    aiStatus.textContent = 'AI Optimization in progress...';
    const result = await chrome.runtime.sendMessage({ action: "runAI", model: aiModelSelect.value });
    aiStatus.textContent = result.success ? 'Optimization Complete' : 'Optimization Failed';
    updateAIChart(aiPerformanceChart, result.data);
    displayAIResults(aiResults, result.data);
  });

  stopAIButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "stopAI" });
    aiStatus.textContent = 'AI Optimization Stopped';
  });
}

function updateAIChart(chartElement, data) {
  new Chart(chartElement, {
    type: 'bar',
    data: {
      labels: data.strategies.map(s => s.name),
      datasets: [{
        label: 'Performance Score',
        data: data.strategies.map(s => s.score),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function displayAIResults(element, data) {
  element.innerHTML = '';
  data.strategies.forEach(strategy => {
    const strategyDiv = document.createElement('div');
    strategyDiv.textContent = `${strategy.name}: Score - ${strategy.score.toFixed(2)}`;
    element.appendChild(strategyDiv);
  });
}

function setupReports() {
  const reportList = document.getElementById('reportList');
  const generateReportButton = document.getElementById('generateReport');
  const reportChart = document.getElementById('reportChart');

  generateReportButton.addEventListener('click', async () => {
    const report = await chrome.runtime.sendMessage({ action: "generateReport" });
    if (report) {
      const reportItem = document.createElement('div');
      reportItem.textContent = report.name;
      reportItem.dataset.id = report.id;
      reportList.appendChild(reportItem);
      updateReportChart(reportChart, report.data);
    }
  });

  chrome.storage.local.get('reports', ({ reports }) => {
    if (reports) {
      reports.forEach(report => {
        let item = document.createElement('div');
        item.textContent = report.name;
        item.dataset.id = report.id;
        reportList.appendChild(item);
      });
    }
  });

  function updateReportChart(chartElement, data) {
    new Chart(chartElement, {
      type: 'line',
      data: {
        labels: data.dates,
        datasets: [{
          label: 'Performance',
          data: data.performance,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}

function setupSettings() {
  const apiKeyInput = document.getElementById('apiKey');
  const saveApiKeyButton = document.getElementById('saveApiKey');
  const enableNotifications = document.getElementById('enableNotifications');
  const themeSelect = document.getElementById('themeSelect');

  // Load saved settings
  chrome.storage.local.get(['apiKey', 'notificationsEnabled', 'theme'], ({ apiKey, notificationsEnabled, theme }) => {
    apiKeyInput.value = apiKey || '';
    enableNotifications.checked = notificationsEnabled || false;
    themeSelect.value = theme || 'light';
    updateTheme(theme || 'light');
  });

  saveApiKeyButton.addEventListener('click', () => {
    chrome.storage.local.set({ apiKey: apiKeyInput.value });
    alert('API Key Saved');
  });

  enableNotifications.addEventListener('change', () => {
    chrome.storage.local.set({ notificationsEnabled: enableNotifications.checked });
  });

  themeSelect.addEventListener('change', (e) => {
    updateTheme(e.target.value);
    chrome.storage.local.set({ theme: e.target.value });
  });

  function updateTheme(theme) {
    document.body.className = theme;
  }
}

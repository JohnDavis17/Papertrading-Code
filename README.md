Photon Paper Trading Utility V2.0
Welcome to the GitHub repository for the "Photon Paper Trading Utility V2.0" Chrome extension! This extension transforms your browser into a sophisticated trading simulator, integrating seamlessly with Photon's trading platform. 
Here's what you'll find in this repository:

Features
Real-time Market Data: Stream live market data using WebSocket for up-to-the-second price, volume, and trade information.
Strategy Management: Create, edit, and backtest trading strategies with historical data to refine your trading approach.
AI Optimization: Leverage machine learning to optimize trading strategies. Choose from different AI models for analysis.
Comprehensive Reporting: Generate detailed performance reports with visual charts for in-depth analysis of your trading strategies.
Customizable User Experience: Adjust settings for API keys, notifications, and UI themes to suit your preferences.

File Structure
manifest.json - Configuration file for the Chrome extension, defining permissions, background scripts, and content scripts.
popup.html - The main user interface where users interact with the extension.
popup.js - JavaScript controlling the popup's functionality including strategy management, AI optimization, live data display, reports, and settings.
popup.css - Styles for the popup user interface.
background.js - Manages background tasks, WebSocket connections, and communication between different parts of the extension.
worker.js - Web worker for processing live data streams without blocking the main thread.
aiWorker.js - Separate worker for running AI optimizations to ensure performance.
content.js - Content script that interacts with Photon's web pages to inject dynamic content or modify the page.
injected.js - Script injected into Photon's site for real-time updates and UI enhancements.
charts.js - Custom Chart.js configurations for rendering live charts and reports.
dataAnalysis.js - Helper functions for data processing and analysis.
userInterface.js - Additional UI manipulation and control logic.



Installation
Clone this repository:
Load the unpacked extension in Chrome:
Go to chrome://extensions/
Enable Developer Mode at the top right
Click "Load unpacked" and select the folder containing this repository

Usage
After installation, click the extension icon to open the popup UI.
Log in with your Photon credentials using OAuth.
Navigate through the dashboard, strategy management, AI optimization, reports, and settings tabs to leverage all functionalities.

Requirements
Chrome browser with extension support.
Access to Photon's trading platform (for real-time data).

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("React Entry: Initializing...");

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("React Entry: #root element missing!");
} else {
  console.log("React Entry: #root found, mounting app...");
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("React Entry: Render complete.");
}
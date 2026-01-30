// ===============================
// File: frontend/src/App.test.js
// Purpose: Default CRA (Create React App) Test File
// Notes:
// 1) This is the auto-generated test from React starter template
// 2) It checks if "learn react" text exists in App component
// 3) In your yesSir project, this may not match UI and can fail if not updated
// ===============================

import { render, screen } from '@testing-library/react'; // ✅ React Testing Library helpers
import App from './App'; // ✅ Main App component

// ✅ Basic test case (default template)
test('renders learn react link', () => {
  render(<App />); // ✅ render App in virtual DOM

  // ✅ find element containing "learn react"
  const linkElement = screen.getByText(/learn react/i);

  // ✅ assertion: element must exist in document
  expect(linkElement).toBeInTheDocument();
});

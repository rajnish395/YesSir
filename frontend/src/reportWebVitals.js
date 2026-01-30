// ===============================
// File: frontend/src/reportWebVitals.js
// Purpose: Performance Metrics Reporter (CRA Default)
// Features:
// 1) If a callback function is provided (onPerfEntry), it loads "web-vitals"
// 2) Collects Core Web Vitals metrics:
//    - CLS (Cumulative Layout Shift)
//    - FID (First Input Delay)
//    - FCP (First Contentful Paint)
//    - LCP (Largest Contentful Paint)
//    - TTFB (Time To First Byte)
// 3) Sends results to the provided callback
// Note:
// - This is default Create React App utility
// - Not required for core yesSir app functionality unless you track performance
// ===============================

const reportWebVitals = onPerfEntry => {
  // ✅ Ensure callback exists and is a function
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // ✅ Dynamically import web-vitals only when needed (saves bundle size)
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      // ✅ Capture performance metrics and pass them to callback
      getCLS(onPerfEntry);  // Layout stability
      getFID(onPerfEntry);  // Input responsiveness
      getFCP(onPerfEntry);  // First content paint
      getLCP(onPerfEntry);  // Largest paint element
      getTTFB(onPerfEntry); // Server response speed
    });
  }
};

export default reportWebVitals; // ✅ export for use in index.js (optional)

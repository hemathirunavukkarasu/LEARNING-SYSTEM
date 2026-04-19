import React, { createContext, useContext, useState } from 'react';

const TestContext = createContext(null);

export function TestProvider({ children }) {
  const [testResult, setTestResult] = useState(null);

  return (
    <TestContext.Provider value={{ testResult, setTestResult }}>
      {children}
    </TestContext.Provider>
  );
}

// Use in ResultPage and GroupSuggestionPage
export function useTest() {
  return useContext(TestContext);
}

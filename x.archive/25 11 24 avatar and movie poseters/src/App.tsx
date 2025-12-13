import React from 'react';
import { UserProvider, useUser } from './contexts/UserContext';
import { ProfileSelectionScreen } from './components/ProfileSelectionScreen';
import { MainWatchBoxScreen } from './components/MainWatchBoxScreen';

function AppContent() {
  const { currentUser } = useUser();

  return currentUser ? <MainWatchBoxScreen /> : <ProfileSelectionScreen />;
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;


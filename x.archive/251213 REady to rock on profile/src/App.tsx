import { UserProvider, useUser } from './contexts/UserContext';
import { DesignSystemProvider } from './contexts/DesignSystemContext';
import { ProfileSelectionScreen } from './components/ProfileSelectionScreen';
import { MainWatchBoxScreen } from './components/MainWatchBoxScreen';
import { DesignSystemPanel } from './components/DesignSystemPanel';

function AppContent() {
  const { currentUser } = useUser();

  return (
    <>
      {currentUser ? <MainWatchBoxScreen /> : <ProfileSelectionScreen />}
      <DesignSystemPanel />
    </>
  );
}

function App() {
  return (
    <DesignSystemProvider>
    <UserProvider>
      <AppContent />
    </UserProvider>
    </DesignSystemProvider>
  );
}

export default App;


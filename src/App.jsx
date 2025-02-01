import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { UserProvider } from './context/UserContext';
import { PageTitleProvider } from './context/PageTitleContext';

function App() {
 

  return (
    <UserProvider>
      <PageTitleProvider>
        <Router>
          <AppRoutes />
        </Router>
      </PageTitleProvider>  
    </UserProvider>
  );
}

export default App;
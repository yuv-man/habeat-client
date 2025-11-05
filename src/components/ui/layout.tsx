import { ReactNode } from 'react';
import NavBar from './navbar';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const hideNavBarPaths = ['/register', '/auth/callback', '/goals'];
  const shouldShowNavBar = !hideNavBarPaths.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-20">
        {children}
      </main>
      {shouldShowNavBar && <NavBar />}
    </div>
  );
};

export default Layout;

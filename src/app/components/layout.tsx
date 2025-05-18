import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh' }}>
      <header style={{ position: 'absolute', top: 0, left: 0, padding: '20px', color: '#00FF47', fontSize: '2.5rem' }}>
        <a href="/">
            CINE
        </a>
      </header>
      <main style={{ marginTop: '80px', width: '100%', height: '100%', display: 'flex', justifyContent: "center", alignItems: "center" }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
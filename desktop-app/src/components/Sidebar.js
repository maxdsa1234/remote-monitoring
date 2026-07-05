import React from 'react';

const Sidebar = ({ activeTab, setActiveTab, handleSignOut }) => {
  const menuItems = [
    { id: 'home', label: 'Home' },
    { id: 'patients', label: 'Patients' },
  ];

  return (
    <aside style={styles.sidebar}>
      {/* Logo Section */}
      <div style={styles.logoSection}>
        <span style={styles.logoIcon}>+</span>
        <h2 style={styles.logoText}>CardiaCare</h2>
      </div>

      {/* Navigation Links */}
      <nav style={styles.navContainer}>
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                ...styles.navItem,
                backgroundColor: isActive ? '#031d36' : 'transparent',
                color: isActive ? '#6fc3fc' : '#BDC3C7',
                borderLeft: isActive ? '4px solid #6fc3fc' : '4px solid transparent',
                
              }}
            >
              <span style={styles.label}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout Section */}
      <div style={styles.footer}>
        <button 
          onClick={handleSignOut}
          style={styles.logoutBtn}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#E74C3C';
            e.target.style.color = 'white';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#E74C3C';
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
};


const styles = {
  sidebar: {
    width: '240px',
    backgroundColor: '#0a2e52',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
    boxShadow: '2px 0 10px rgba(0,0,0,0.2)',
    zIndex: 100,
  },
  logoSection: {
    padding: '30px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid #34495E',
  },
  logoIcon: {
    fontSize: '26px',
    color: '#3498DB',
    fontWeight: 'bold',
  },
  logoText: {
    margin: 0,
    fontSize: '25px',
    color: '#ECF0F1',
    letterSpacing: '1px',
    fontWeight: '600',
  },
  navContainer: {
    flex: 1,
    paddingTop: '20px',
  },
  navItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: '16px 20px',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    fontSize: '15px',
    fontWeight: '600',
    textAlign: 'left',
    transition: 'all 0.2s ease',
  },
  icon: {
    marginRight: '15px',
    fontSize: '18px',
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  footer: {
    padding: '20px',
    borderTop: '1px solid #34495E',
  },
  logoutBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'transparent',
    color: '#E74C3C',
    border: '1px solid #E74C3C',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: '0.3s',
  },
};

export default Sidebar;
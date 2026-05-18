
export default function Navbar() {
  return (
    <nav style={{
      background: 'linear-gradient(135deg, #2e3440 0%, #3b4252 100%)',
      padding: '1rem 2rem',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '100%'
      }}>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#88c0d0',
          letterSpacing: '2px'
        }}>
          ⚡ SICAE
        </div>
        <div style={{
          fontSize: '0.9rem',
          color: '#d8dee9'
        }}>
          Simulador de Campo Eléctrico
        </div>
      </div>
    </nav>
  )
}
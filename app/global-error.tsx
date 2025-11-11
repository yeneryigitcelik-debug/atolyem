"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          padding: '20px',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Bir hata oluştu</h1>
          <p style={{ color: '#666', marginBottom: '24px', textAlign: 'center' }}>
            {error.message || 'Beklenmeyen bir hata oluştu'}
          </p>
          {error.digest && (
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '24px' }}>
              Hata ID: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              padding: '12px 24px',
              backgroundColor: '#D97706',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Tekrar Dene
          </button>
        </div>
      </body>
    </html>
  );
}


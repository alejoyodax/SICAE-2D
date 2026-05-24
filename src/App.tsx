import { Stage, Layer, Circle, Text, Arrow } from 'react-konva';
import { useState, useEffect, useRef } from 'react';

import Navbar from './components/Navbar.component/Navbar.component';

// CARGA
interface Carga {
  posicion: { x: number; y: number };
  magnitud: number;
  signo: 'positiva' | 'negativa';
}


// Celda de la grilla de puntos
interface CeldaGrilla {
  posicion: { x: number; y: number }; // coordenadas en unidades de simulador
  direccion: { ux: number; uy: number }; // vector unitario (dirección)
  magnitud: number; // magnitud del campo en N/C o V/m
  // opcional: cachedAngle?: number;
}clearInterval

// Función para generar una grilla de puntos basada en altura y anchura de la pantalla
const generarGrillaInicial = (ancho: number, alto: number, espaciado: number = 90): CeldaGrilla[] => {
  const celdas: CeldaGrilla[] = [];
  
  for (let x = espaciado / 2; x < ancho; x += espaciado) {
    for (let y = espaciado / 2; y < alto; y += espaciado) {
      celdas.push({
        posicion: { x, y },
        direccion: { ux: 0, uy: 0 },
        magnitud: 0,
      });
    }
  }

  return celdas;
};


const mapMagnitudToOpacity = (magnitud: number, minMagnitud: number, maxMagnitud: number, minOpacity: number, maxOpacity: number): number => {
  if (maxMagnitud === minMagnitud) return minOpacity;
  const normalizado = Math.max(0, Math.min(1, (magnitud - minMagnitud) / (maxMagnitud - minMagnitud)));
  return minOpacity + (maxOpacity - minOpacity) * normalizado;
};

// Función para calcular el campo eléctrico en un punto debido a una carga
// Usa píxeles como medida de distancia (no afecta la simulación)
// k nos define la intensidad del campo
const calcularCampoEnPunto = (
  posicionPunto: { x: number; y: number },
  carga: Carga,
  k: number = 100
): { magnitud: number; direccion: { ux: number; uy: number } } => {
  const dx = posicionPunto.x - carga.posicion.x;
  const dy = posicionPunto.y - carga.posicion.y;
  const distancia = Math.sqrt(dx * dx + dy * dy);

  if (distancia < 1) {
    return { magnitud: 0, direccion: { ux: 0, uy: 0 } };
  }

  // Magnitud del campo: E = k * q / r²
  const magnitudCampo = (k * carga.magnitud) / (distancia * distancia);
3
  // Dirección: vector unitario desde carga al punto
  // Para carga negativa, el campo apunta hacia la carga (invertir dirección)
  const signo = carga.signo === 'negativa' ? -1 : 1;
  const ux = (signo * dx) / distancia;
  const uy = (signo * dy) / distancia;

  return { magnitud: magnitudCampo, direccion: { ux, uy } };
};

// Función para calcular el campo total en un punto debido a todas las cargas
const calcularCampoTotal = (
  posicionPunto: { x: number; y: number },
  cargas: Carga[],
  k: number = 100
): { magnitud: number; direccion: { ux: number; uy: number } } => {
  let Ex = 0;
  let Ey = 0;

  for (const carga of cargas) {
    const campo = calcularCampoEnPunto(posicionPunto, carga, k);
    Ex += campo.direccion.ux * campo.magnitud;
    Ey += campo.direccion.uy * campo.magnitud;
  }

  const magnitud = Math.sqrt(Ex * Ex + Ey * Ey);
  if (magnitud < 0.0001) {
    return { magnitud: 0, direccion: { ux: 0, uy: 0 } };
  }

  return {
    magnitud,
    direccion: { ux: Ex / magnitud, uy: Ey / magnitud },
  };
};

// Función para actualizar el campo en todos los puntos de la grilla
const actualizarGrilla = (celdas: CeldaGrilla[], cargas: Carga[], k: number = 100): CeldaGrilla[] => {
  return celdas.map((celda) => {
    const campo = calcularCampoTotal(celda.posicion, cargas, k);
    return {
      ...celda,
      magnitud: campo.magnitud,
      direccion: campo.direccion,
    };
  });
};





const App = () => {
  // Estado para almacenar la posición del círculo
  const [position, setPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  // Array para almacenar las cargas eléctricas
  const [cargas, setCargas] = useState([
    { posicion: { x: 300, y: 600 }, magnitud: 5, signo: 'negativa' },
    // { posicion: { x: 100, y: 200 }, magnitud: -5, signo: 'positiva' },
  ]);

  // Puntos en la pantalla para mostrar la dirección del campo eléctrico
  const [celdas, setCeldas] = useState(generarGrillaInicial(window.innerWidth, window.innerHeight));

  // Configuración de opacidad para las flechas
  const [minOpacity, setMinOpacity] = useState(0.1);
  const [maxOpacity, setMaxOpacity] = useState(1);
  const [maxMagnitudDisplay, setMaxMagnitudDisplay] = useState(10);
  const [constanteK, setConstanteK] = useState(100);

  // Refs para acceso rápido sin re-renders
  const cargasRef = useRef(cargas);
  const celdasRef = useRef(celdas);
  const constanteKRef = useRef(constanteK);

  // Actualizar refs cuando cambien los valores
  useEffect(() => {
    cargasRef.current = cargas;
  }, [cargas]);

  useEffect(() => {
    celdasRef.current = celdas;
  }, [celdas]);

  useEffect(() => {
    constanteKRef.current = constanteK;
  }, [constanteK]);



  // Calcular el campo inicial cuando monta el componente
  useEffect(() => {
    const grillaInicial = actualizarGrilla(celdas, cargas as Carga[], constanteK);
    setCeldas(grillaInicial);
  }, []);



  return (
    <>
      <Navbar />
      <div style={{
        background: 'linear-gradient(135deg, #2e3440 0%, #3b4252 100%)',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Stage width={window.innerWidth} height={window.innerHeight - 60}>
          <Layer>
            {/* Renderizar flechas de la grilla o puntos si magnitud es cero */}
            {celdas.map((celda, index) => {
              // Si la magnitud es efectivamente cero o muy cercana a cero, mostrar un punto
              if (celda.magnitud < 0.001) {
                return (
                  <Circle
                    key={`point-${index}`}
                    x={celda.posicion.x}
                    y={celda.posicion.y - 60}
                    radius={2}
                    fill="#5e81ac"
                    opacity={0.4}
                  />
                );
              }

              // Si hay magnitud, mostrar flecha
              const opacity = Math.max(0.3, mapMagnitudToOpacity(celda.magnitud, 0, maxMagnitudDisplay, minOpacity, maxOpacity));
              const largoFlecha = 30;
              const x1 = celda.posicion.x;
              const y1 = celda.posicion.y - 60;
              const x2 = x1 + celda.direccion.ux * largoFlecha;
              const y2 = y1 + celda.direccion.uy * largoFlecha;

              return (
                <Arrow
                  key={`arrow-${index}`}
                  points={[x1, y1, x2, y2]}
                  pointerLength={8}
                  pointerWidth={8}
                  fill="white"
                  stroke="white"
                  strokeWidth={3}
                  opacity={opacity}
                  shadowColor="black"
                  shadowBlur={1}
                />
              );
            })}
            {/* Debug: mostrar cantidad de flechas */}
            <Text 
              text={`Cargas: ${cargas.length} | Celdas: ${celdas.length}`} 
              x={10} 
              y={30}
              fill="#eceff4"
              fontSize={14}
            />
          </Layer>
          <Layer>
            {/* Renderizar las cargas eléctricas */}
            {cargas.map((carga, index) => (
              <Circle
                key={`carga-${index}`}
                x={carga.posicion.x}
                y={carga.posicion.y - 60}
                radius={20}
                style={{ cursor: 'pointer' }}
                draggable
                onDragMove={(e) => {
                  // NO hacer nada durante el arrastre - sin setState
                }}
                onDragEnd={(e) => {
                  // Actualizar la carga y recalcular la grilla al soltar
                  const nuevasCargas = cargas.map((c, i) =>
                    i === index
                      ? { ...c, posicion: { x: e.target.x(), y: e.target.y() + 60 } }
                      : c
                  );
                  setCargas(nuevasCargas as any);
                  setPosition({ x: e.target.x(), y: e.target.y() });
                  const grillaActualizada = actualizarGrilla(celdas, nuevasCargas as Carga[], constanteK);
                  setCeldas(grillaActualizada);
                }}
                onClick={() => {
                  const nuevasCargas = cargas.filter((_, i) => i !== index);
                  setCargas(nuevasCargas as any);
                  const grillaActualizada = actualizarGrilla(celdas, nuevasCargas as Carga[], constanteK);
                  setCeldas(grillaActualizada);
                }}
                fill={carga.signo == "negativa" ? '#FF0000' : '#0066FF'}
                shadowColor="black"
                shadowBlur={8}
                shadowOpacity={0.6}
                onMouseEnter={(e) => {
                  e.target.to({ radius: 24, duration: 0.1 });
                }}
                onMouseLeave={(e) => {
                  e.target.to({ radius: 20, duration: 0.1 });
                }}
              />
            ))}

          {/* Mostrar la posición del círculo */}
          <Text text={`Pos: (${position.x.toFixed(0)}, ${(position.y - 60).toFixed(0)})`} x={10} y={10} fill="#d8dee9" fontSize={12} />  
        </Layer>
      </Stage>

      {/* Botones para añadir y eliminar cargas */}
      <div style={{ 
        position: 'absolute', 
        top: 80, 
        right: 20, 
        background: 'rgba(46, 52, 64, 0.95)', 
        padding: '15px', 
        color: 'white', 
        borderRadius: '8px', 
        fontSize: '12px', 
        display: 'flex', 
        flexDirection: 'column',
        gap: '10px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(163, 190, 140, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        minWidth: '140px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              const nuevaCarga = {
                posicion: { x: Math.random() * (window.innerWidth - 100) + 50, y: Math.random() * (window.innerHeight - 200) + 100 },
                magnitud: 5,
                signo: 'positiva' as const,
              };
              const nuevasCargas = [...cargas, nuevaCarga];
              setCargas(nuevasCargas as any);
              const grillaActualizada = actualizarGrilla(celdas, nuevasCargas as Carga[], constanteK);
              setCeldas(grillaActualizada);
            }}
            style={{
              padding: '8px 10px',
              background: 'linear-gradient(135deg, #81a1c1 0%, #88c0d0 100%)',
              color: '#2e3440',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '700',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(136, 192, 208, 0.4)',
              flex: 1
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(136, 192, 208, 0.6)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(136, 192, 208, 0.4)';
            }}
          >
            + Positiva
          </button>
          <button
            onClick={() => {
              const nuevaCarga = {
                posicion: { x: Math.random() * (window.innerWidth - 100) + 50, y: Math.random() * (window.innerHeight - 200) + 100 },
                magnitud: 5,
                signo: 'negativa' as const,
              };
              const nuevasCargas = [...cargas, nuevaCarga];
              setCargas(nuevasCargas as any);
              const grillaActualizada = actualizarGrilla(celdas, nuevasCargas as Carga[], constanteK);
              setCeldas(grillaActualizada);
            }}
            style={{
              padding: '8px 10px',
              background: 'linear-gradient(135deg, #bf616a 0%, #d08770 100%)',
              color: '#eceff4',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '700',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(191, 97, 106, 0.4)',
              flex: 1
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(191, 97, 106, 0.6)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(191, 97, 106, 0.4)';
            }}
          >
            + Negativa
          </button>
        </div>

        <div style={{ height: '1px', background: 'rgba(163, 190, 140, 0.2)' }} />

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              if (cargas.length > 0) {
                const nuevasCargas = cargas.slice(0, -1);
                setCargas(nuevasCargas as any);
                const grillaActualizada = actualizarGrilla(celdas, nuevasCargas as Carga[], constanteK);
                setCeldas(grillaActualizada);
              }
            }}
            style={{
              padding: '8px 10px',
              background: 'linear-gradient(135deg, #ebcb8b 0%, #d8b48d 100%)',
              color: '#2e3440',
              border: 'none',
              borderRadius: '6px',
              cursor: cargas.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '11px',
              fontWeight: '700',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(235, 203, 139, 0.4)',
              opacity: cargas.length === 0 ? 0.5 : 1,
              flex: 1
            }}
            onMouseOver={(e) => {
              if (cargas.length > 0) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(235, 203, 139, 0.6)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(235, 203, 139, 0.4)';
            }}
            disabled={cargas.length === 0}
          >
            - Última
          </button>
          <button
            onClick={() => {
              setCargas([] as any);
              const grillaInicial = generarGrillaInicial(window.innerWidth, window.innerHeight);
              const grillaActualizada = actualizarGrilla(grillaInicial, [], constanteK);
              setCeldas(grillaActualizada);
            }}
            style={{
              padding: '8px 10px',
              background: 'linear-gradient(135deg, #b48ead 0%, #a3be8c 100%)',
              color: '#2e3440',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '700',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(163, 190, 140, 0.4)',
              flex: 1
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(163, 190, 140, 0.6)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(163, 190, 140, 0.4)';
            }}
          >
            🗑️ Limpiar
          </button>
        </div>
      </div>

      {/* Controles para ajustar opacidad */}
      <div style={{ 
        position: 'absolute', 
        bottom: 20, 
        left: 20, 
        background: 'rgba(46, 52, 64, 0.95)', 
        padding: '20px', 
        color: '#d8dee9', 
        borderRadius: '8px', 
        fontSize: '12px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(163, 190, 140, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        maxWidth: '280px'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#88c0d0', fontWeight: 'bold' }}>Opacidad mínima</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={minOpacity}
            onChange={(e) => setMinOpacity(parseFloat(e.target.value))}
            style={{ width: '100%', marginBottom: '4px' }}
          />
          <span style={{ color: '#a3be8c' }}>{minOpacity.toFixed(1)}</span>
        </div>
        <div style={{ marginTop: '14px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#88c0d0', fontWeight: 'bold' }}>Opacidad máxima</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={maxOpacity}
            onChange={(e) => setMaxOpacity(parseFloat(e.target.value))}
            style={{ width: '100%', marginBottom: '4px' }}
          />
          <span style={{ color: '#a3be8c' }}>{maxOpacity.toFixed(1)}</span>
        </div>
        <div style={{ marginTop: '14px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#88c0d0', fontWeight: 'bold' }}>Magnitud máxima</label>
          <input
            type="range"
            min="1"
            max="50"
            step="1"
            value={maxMagnitudDisplay}
            onChange={(e) => setMaxMagnitudDisplay(parseFloat(e.target.value))}
            style={{ width: '100%', marginBottom: '4px' }}
          />
          <span style={{ color: '#a3be8c' }}>{maxMagnitudDisplay.toFixed(0)}</span>
        </div>
        <div style={{ marginTop: '14px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#88c0d0', fontWeight: 'bold' }}>Constante K</label>
          <input
            type="range"
            min="10"
            max="500"
            step="10"
            value={constanteK}
            onChange={(e) => {
              const nuevoK = parseFloat(e.target.value);
              setConstanteK(nuevoK);
              const grillaActualizada = actualizarGrilla(celdas, cargas as Carga[], nuevoK);
              setCeldas(grillaActualizada);
            }}
            style={{ width: '100%', marginBottom: '4px' }}
          />
          <span style={{ color: '#a3be8c' }}>{constanteK.toFixed(0)}</span>
        </div>
      </div>
    </div>
    </>
  );
};

export default App;

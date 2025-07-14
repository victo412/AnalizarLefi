import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const DIAS = ["L", "M", "X", "J", "V", "S", "D"];
// Generar opciones de duración de 15 a 720 minutos (12 horas) en intervalos de 15
const DURACIONES = Array.from({length: (720/15)}, (_, i) => (i+1)*15);

export default function OnboardingStepPersonales({ value, onChange, prev }) {
  const [bloques, setBloques] = useState(value || []);
  const [nuevo, setNuevo] = useState({
    nombre_actividad: "",
    dias: [],
    hora_inicio: "",
    duracion: 60,
    es_flexible: true,
  });

  const agregar = () => {
    if (!nuevo.nombre_actividad || !nuevo.hora_inicio || !nuevo.duracion || nuevo.dias.length === 0) return;
    // Calcular hora_fin sumando duración a hora_inicio
    const [h, m] = nuevo.hora_inicio.split(":").map(Number);
    const start = new Date(1970, 0, 1, h, m);
    const end = new Date(start.getTime() + Number(nuevo.duracion) * 60000);
    const hora_fin = end.toTimeString().slice(0,5);
    setBloques([...bloques, { ...nuevo, hora_fin, bloque_tipo: "personal" }]);
    setNuevo({ nombre_actividad: "", dias: [], hora_inicio: "", duracion: 60, es_flexible: true });
  };

  const eliminar = idx => setBloques(bloques.filter((_, i) => i !== idx));

  const guardar = () => {
    // Si hay datos en el formulario actual, agrégalos antes de continuar
    let nuevosBloques = bloques;
    if (
      nuevo.nombre_actividad &&
      nuevo.hora_inicio &&
      nuevo.duracion &&
      nuevo.dias.length > 0
    ) {
      nuevosBloques = [...bloques, { ...nuevo, bloque_tipo: "personal" }];
      setBloques(nuevosBloques);
      setNuevo({ nombre_actividad: "", dias: [], hora_inicio: "", duracion: 60, es_flexible: true });
    }
    onChange(nuevosBloques);
  };

  // Generar opciones de hora de inicio
  const HORAS = Array.from({length: ((23-6)*4)+4}, (_, i) => {
    const h = 6 + Math.floor(i/4);
    const m = (i%4)*15;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
  });

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Card className="w-full max-w-xl shadow-glow">
        <CardHeader>
          <CardTitle className="text-lg gradient-text">Espacios personales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Lista de espacios personales agregados */}
            {bloques.length > 0 && (
              <div className="mb-4">
                <div className="font-medium mb-2 text-muted-foreground">Tus espacios personales:</div>
                <ul className="space-y-2">
                  {bloques.map((b, i) => (
                    <li key={i} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{b.nombre_actividad}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{b.hora_inicio} - {b.hora_fin}</span>
                          <span className="flex gap-1">
                            {b.dias.map(dia => <Badge key={dia} variant="outline" className="px-1 py-0.5 text-xs">{dia}</Badge>)}
                          </span>
                          {b.es_flexible && <Badge className="bg-green-500 text-white ml-2">Flexible</Badge>}
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => eliminar(i)} title="Eliminar" className="ml-2">
                        ×
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Formulario para nuevo espacio personal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Actividad *</Label>
                <Input placeholder="Ej: Leer, Meditar..." value={nuevo.nombre_actividad} onChange={e => setNuevo(n => ({ ...n, nombre_actividad: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Hora inicio *</Label>
                <select
                  className="w-full border rounded-md px-2 py-2 bg-background"
                  value={nuevo.hora_inicio}
                  onChange={e => setNuevo(n => ({ ...n, hora_inicio: e.target.value }))}
                >
                  <option value="">Selecciona una hora</option>
                  {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Duración *</Label>
                <select
                  className="w-full border rounded-md px-2 py-2 bg-background"
                  value={nuevo.duracion}
                  onChange={e => setNuevo(n => ({ ...n, duracion: Number(e.target.value) }))}
                >
                  {DURACIONES.map(d => {
                    const h = Math.floor(d/60);
                    const m = d%60;
                    const label = h > 0 ? `${d} min (${h}h${m > 0 ? ` ${m}m` : ''})` : `${d} min`;
                    return <option key={d} value={d}>{label}</option>;
                  })}
                </select>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" id="flexible-personal" checked={nuevo.es_flexible} onChange={e => setNuevo(n => ({ ...n, es_flexible: e.target.checked }))} />
                <Label htmlFor="flexible-personal" className="text-sm">Flexible</Label>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Label className="mr-2">Días *</Label>
              {DIAS.map(dia => (
                <Button
                  key={dia}
                  type="button"
                  size="sm"
                  variant={nuevo.dias.includes(dia) ? "default" : "outline"}
                  className={nuevo.dias.includes(dia) ? "bg-primary text-white" : ""}
                  onClick={() => setNuevo(n => ({
                    ...n,
                    dias: n.dias.includes(dia)
                      ? n.dias.filter(d => d !== dia)
                      : [...n.dias, dia]
                  }))}
                >
                  {dia}
                </Button>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <Button type="button" onClick={agregar} className="shadow-glow">Agregar espacio personal</Button>
              <Button type="button" variant="secondary" onClick={prev}>Atrás</Button>
              <Button type="button" variant="secondary" onClick={guardar}>Continuar</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
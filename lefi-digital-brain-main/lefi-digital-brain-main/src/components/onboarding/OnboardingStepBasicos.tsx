import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const TIPOS = [
  { tipo: "comida", label: "Comida principal" },
  { tipo: "cena", label: "Cena" },
  { tipo: "sueño_semana", label: "Hora de dormir (semana)" },
  { tipo: "sueño_findes", label: "Hora de dormir (findes)" },
];

export default function OnboardingStepBasicos({ value, onChange, prev }) {
  const [basicos, setBasicos] = useState(value || []);
  const [nuevo, setNuevo] = useState({ tipo: "comida", hora: "", duracion_minutos: 60, rango_flexible: false });

  const agregar = () => {
    if (!nuevo.hora) return;
    setBasicos([...basicos, { ...nuevo }]);
    setNuevo({ tipo: "comida", hora: "", duracion_minutos: 60, rango_flexible: false });
  };

  const eliminar = idx => setBasicos(basicos.filter((_, i) => i !== idx));

  const guardar = () => {
    // Si hay datos en el formulario actual, agrégalos antes de continuar
    let nuevosBasicos = basicos;
    if (nuevo.hora) {
      nuevosBasicos = [...basicos, { ...nuevo }];
      setBasicos(nuevosBasicos);
      setNuevo({ tipo: "comida", hora: "", duracion_minutos: 60, rango_flexible: false });
    }
    onChange(nuevosBasicos);
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
          <CardTitle className="text-lg gradient-text">Necesidades básicas y hábitos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Lista de hábitos agregados */}
            {basicos.length > 0 && (
              <div className="mb-4">
                <div className="font-medium mb-2 text-muted-foreground">Tus hábitos:</div>
                <ul className="space-y-2">
                  {basicos.map((b, i) => (
                    <li key={i} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{TIPOS.find(t => t.tipo === b.tipo)?.label}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{b.hora} ({b.duracion_minutos} min)</span>
                          {b.rango_flexible && <Badge className="bg-green-500 text-white ml-2">Flexible</Badge>}
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

            {/* Formulario para nuevo hábito */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <select
                  className="w-full border rounded-md px-2 py-2 bg-background"
                  value={nuevo.tipo}
                  onChange={e => setNuevo(n => ({ ...n, tipo: e.target.value }))}
                >
                  {TIPOS.map(t => <option key={t.tipo} value={t.tipo}>{t.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Hora *</Label>
                <select
                  className="w-full border rounded-md px-2 py-2 bg-background"
                  value={nuevo.hora}
                  onChange={e => setNuevo(n => ({ ...n, hora: e.target.value }))}
                >
                  <option value="">Selecciona una hora</option>
                  {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Duración (min)</Label>
                <Input type="number" min={10} max={180} value={nuevo.duracion_minutos} onChange={e => setNuevo(n => ({ ...n, duracion_minutos: Number(e.target.value) }))} />
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" id="flexible" checked={nuevo.rango_flexible} onChange={e => setNuevo(n => ({ ...n, rango_flexible: e.target.checked }))} />
                <Label htmlFor="flexible" className="text-sm">Flexible</Label>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button type="button" onClick={agregar} className="shadow-glow">Agregar</Button>
              <Button type="button" variant="secondary" onClick={prev}>Atrás</Button>
              <Button type="button" variant="secondary" onClick={guardar}>Continuar</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
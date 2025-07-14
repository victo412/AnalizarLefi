import { useRutinaBase } from '@/hooks/useRutinaBase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

const TIPOS = [
  { tipo: "comida", label: "Comida principal" },
  { tipo: "cena", label: "Cena" },
  { tipo: "sueño_semana", label: "Hora de dormir (semana)" },
  { tipo: "sueño_findes", label: "Hora de dormir (findes)" },
];

export default function OnboardingResumen({ rutina, prev, onComplete }) {
  const { user } = useAuth();
  const { saveRutina } = useRutinaBase();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user?.id) {
        setError('Usuario no autenticado.');
        setLoading(false);
        return;
      }
      console.log('Guardando rutina para usuario:', user.id, rutina);
      await saveRutina(user.id, rutina);
      localStorage.setItem('lefi_onboarding_completed', 'true');
      if (onComplete) onComplete();
      navigate('/');
    } catch (e) {
      setError('Error al guardar la rutina. Revisa la consola.');
      console.error('Error al guardar rutina:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Card className="w-full max-w-xl shadow-glow">
        <CardHeader>
          <CardTitle className="text-lg gradient-text">Resumen de tu rutina base</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Bloques fijos</h3>
              <ul className="space-y-2">
                {rutina.fijos.map((b, i) => (
                  <li key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                    <span className="font-medium text-sm">{b.nombre_actividad}</span>
                    <span className="text-xs text-muted-foreground">{b.hora_inicio}-{b.hora_fin}</span>
                    <span className="flex gap-1">{b.dias.map(dia => <Badge key={dia} variant="outline" className="px-1 py-0.5 text-xs">{dia}</Badge>)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Necesidades básicas</h3>
              <ul className="space-y-2">
                {rutina.basicos.map((b, i) => (
                  <li key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                    <span className="font-medium text-sm">{TIPOS.find(t => t.tipo === b.tipo)?.label}</span>
                    <span className="text-xs text-muted-foreground">{b.hora} ({b.duracion_minutos} min)</span>
                    {b.rango_flexible && <Badge className="bg-green-500 text-white ml-2">Flexible</Badge>}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Espacios personales</h3>
              <ul className="space-y-2">
                {rutina.personales.map((b, i) => (
                  <li key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                    <span className="font-medium text-sm">{b.nombre_actividad}</span>
                    <span className="text-xs text-muted-foreground">{b.hora_inicio}-{b.hora_fin}</span>
                    <span className="flex gap-1">{b.dias.map(dia => <Badge key={dia} variant="outline" className="px-1 py-0.5 text-xs">{dia}</Badge>)}</span>
                    {b.es_flexible && <Badge className="bg-green-500 text-white ml-2">Flexible</Badge>}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-3 mt-4">
              <Button type="button" variant="secondary" onClick={prev}>Atrás</Button>
              <Button type="button" onClick={handleConfirm} className="shadow-glow" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar rutina'}
              </Button>
              {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
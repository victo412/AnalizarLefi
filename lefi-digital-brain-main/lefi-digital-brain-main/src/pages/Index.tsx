
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Calendar, Mic, Moon, Settings, Plus, Inbox, LogOut, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PlannerModule } from '@/components/modules/PlannerModule';
import { SleepRoutineModule } from '@/components/modules/SleepRoutineModule';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import { CreateBlockDialog } from '@/components/dialogs/CreateBlockDialog';
import { InboxDialog } from '@/components/dialogs/InboxDialog';
import { NotificationsDialog } from '@/components/dialogs/NotificationsDialog';
import { ProductiveAssistantDialog } from '@/components/dialogs/ProductiveAssistantDialog';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useBlocks } from '@/hooks/useBlocks';
import { useInbox } from '@/hooks/useInbox';
import WeeklyRoutineTimeline from '@/components/modules/WeeklyRoutineTimeline';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeModules, setActiveModules] = useState(['planner', 'capture', 'sleep']);
  const [completedBlocks, setCompletedBlocks] = useState(0);
  const [showCreateBlock, setShowCreateBlock] = useState(false);
  const [view, setView] = useState<'diaria' | 'semanal'>('diaria');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { blocks } = useBlocks();
  const { createNote, getUnprocessedCount } = useInbox();
  const unprocessedNotesCount = getUnprocessedCount();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Only check onboarding if user is authenticated
    if (user) {
      const hasCompletedOnboarding = localStorage.getItem('lefi_onboarding_completed');
      console.log('Checking onboarding status:', hasCompletedOnboarding);
      if (!hasCompletedOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [user]);

  const handleOnboardingComplete = (selectedModules: string[]) => {
    setActiveModules(selectedModules);
    setShowOnboarding(false);
    localStorage.setItem('lefi_onboarding_completed', 'true');
    toast({
      title: "¡Bienvenido a LEFI! 🧠",
      description: `Hemos activado ${selectedModules.length} módulos para empezar.`,
    });
  };

  const moduleConfig = {
    planner: {
      title: 'Planificador',
      icon: Calendar,
      description: 'Timeline diario con bloques arrastrables',
      color: 'bg-blue-500',
      active: activeModules.includes('planner')
    },
    capture: {
      title: 'Captura Rápida',
      icon: Mic,
      description: 'Notas por voz/texto al inbox',
      color: 'bg-green-500',
      active: activeModules.includes('capture')
    },
    sleep: {
      title: 'Rutinas & Sueño',
      icon: Moon,
      description: 'Alarma inteligente y rutinas',
      color: 'bg-purple-500',
      active: activeModules.includes('sleep')
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <Brain className="h-16 w-16 text-primary mx-auto animate-pulse" />
            <Sparkles className="h-6 w-6 text-primary/60 absolute -top-2 -right-2 animate-bounce" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium gradient-text">Cargando LEFI</p>
            <p className="text-sm text-muted-foreground">Preparando tu segundo cerebro digital...</p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect happens in useEffect, but show nothing while redirecting
  if (!user) {
    return null;
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="min-h-screen bg-background mx-auto max-w-5xl">
      {/* Header - Diseño elegante con glass effect */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md shadow-md border-b border-border/30 py-3">
        <div className="container flex items-center justify-between px-2 sm:px-4 min-h-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Brain className="h-9 w-9 text-primary drop-shadow" />
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur-md" />
            </div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight gradient-text">LEFI</h1>
              <Badge variant="outline" className="text-xs hidden sm:inline-flex bg-primary/10 border-primary/20 px-2 py-0.5 rounded-full font-semibold">MVP</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationsDialog />
            <InboxDialog onNoteProcessed={() => {
              const plannerTab = document.querySelector('[value="planner"]') as HTMLElement;
              if (plannerTab) plannerTab.click();
            }}>
              <Button variant="ghost" size="icon" className="relative flex items-center justify-center rounded-full shadow-glow hover:shadow-glow-hover">
                <Inbox className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full px-1.5 py-0.5 font-bold shadow">{unprocessedNotesCount}</span>
              </Button>
            </InboxDialog>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/60 px-3 py-1 rounded-full shadow-inner">
              <User className="h-5 w-5" />
              <span className="hidden sm:inline font-medium">{user?.email}</span>
              <span className="sm:hidden">•••</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-full shadow-glow hover:shadow-glow-hover">
              <LogOut className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full shadow-glow hover:shadow-glow-hover" onClick={() => window.location.href = '/profile'} title="Perfil">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="px-3 text-xs rounded-full shadow-glow hover:shadow-glow-hover border border-border/30" onClick={async () => {
              localStorage.removeItem('lefi_onboarding_completed');
              if (user) {
                await supabase.from('blocks').delete().eq('user_id', user.id);
                await (supabase as any).from('rutina_base_usuario').delete().eq('user_id', user.id);
                await (supabase as any).from('necesidades_basicas').delete().eq('user_id', user.id);
              }
              window.location.reload();
            }}>Reset</Button>
          </div>
        </div>
      </header>

      {/* Main Content - Diseño mejorado con mejor espaciado */}
      <main className="container px-2 sm:px-4 py-6 sm:py-8 pb-24 sm:pb-8">
        {/* Dashboard Overview - Diseño elegante */}
        <div className="mb-8 sm:mb-10">
          <div className="space-y-3">
            <h1
              className="text-4xl sm:text-5xl font-bold gradient-text leading-normal mb-2"
              style={{ lineHeight: 1.2 }}
            >
              Tu segundo cerebro digital
            </h1>
            <div
              className="text-base sm:text-lg text-muted-foreground max-w-2xl mt-0 mb-0"
              style={{ 
                lineHeight: 1.6, 
                paddingBottom: '0.5em', 
                overflow: 'visible', 
                display: 'block',
                minHeight: '1.6em'
              }}
            >
              Planifica, captura y descansa de forma inteligente con LEFI
            </div>
          </div>
        </div>

        {/* Contenido principal centrado y con ancho limitado */}
        <div className="w-full max-w-4xl mx-auto">
          {/* Selector de vista diaria/semanal (integrado) */}
          <div className="flex justify-end mb-2">
            <div className="inline-flex rounded-lg shadow overflow-hidden border border-primary/20 bg-white/80 backdrop-blur">
              <button
                className={`px-5 py-2 text-sm font-semibold transition-colors duration-150 ${
                  view === 'diaria'
                    ? 'bg-primary text-white shadow-glow'
                    : 'text-primary hover:bg-primary/10'
                }`}
                onClick={() => setView('diaria')}
                disabled={view === 'diaria'}
                style={{ borderRight: '1px solid #e5e7eb' }}
              >
                Vista diaria
              </button>
              <button
                className={`px-5 py-2 text-sm font-semibold transition-colors duration-150 ${
                  view === 'semanal'
                    ? 'bg-primary text-white shadow-glow'
                    : 'text-primary hover:bg-primary/10'
                }`}
                onClick={() => setView('semanal')}
                disabled={view === 'semanal'}
              >
                Vista semanal
              </button>
            </div>
          </div>

          {/* Card principal con aire y sombra */}
          <div className="mb-8">
            <div className="rounded-2xl shadow-glow bg-white/90 p-0 sm:p-2">
              {view === 'diaria' ? (
                <PlannerModule 
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  onBlockComplete={() => setCompletedBlocks(prev => prev + 1)}
                  onSwitchToPlanner={() => {
                    const plannerTab = document.querySelector('[value="planner"]') as HTMLElement;
                    if (plannerTab) plannerTab.click();
                  }}
                />
              ) : (
                <WeeklyRoutineTimeline 
                  onDayClick={date => {
                    setSelectedDate(date);
                    setView('diaria');
                  }}
                />
              )}
            </div>
          </div>

          {/* Métricas alineadas y con aire */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <Card className="shadow-glow hover:shadow-glow-hover transition-all group">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
                  <span>Bloques Completados</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl sm:text-3xl font-bold gradient-text">{completedBlocks}</div>
                <p className="text-xs text-muted-foreground mt-1">Esta semana</p>
              </CardContent>
            </Card>
            <Card className="shadow-glow hover:shadow-glow-hover transition-all group">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full" />
                  <span>Notas Capturadas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl sm:text-3xl font-bold gradient-text">{unprocessedNotesCount}</div>
                <p className="text-xs text-muted-foreground mt-1">En inbox</p>
              </CardContent>
            </Card>
            <Card className="shadow-glow hover:shadow-glow-hover transition-all group">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" />
                  <span>Bloques Totales</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl sm:text-3xl font-bold gradient-text">{blocks.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Bloques hoy</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions - FAB elegante */}
        <div className="fixed bottom-6 right-6 z-40 flex flex-col space-y-3">
          <ProductiveAssistantDialog
            trigger={
              <Button 
                size="lg" 
                className="rounded-full h-14 w-14 shadow-glow hover:shadow-glow-hover transition-all bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                title="Asistente Día Productivo"
              >
                <Brain className="h-6 w-6" />
              </Button>
            }
          />
          <CreateBlockDialog 
            trigger={
              <Button 
                size="lg" 
                className="rounded-full h-14 w-14 shadow-glow hover:shadow-glow-hover transition-all"
                title="Crear nuevo bloque"
              >
                <Plus className="h-6 w-6" />
              </Button>
            }
            onBlockCreated={() => {}}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;

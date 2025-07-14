
import { useState } from "react";
import OnboardingStepFijos from "./OnboardingStepFijos";
import OnboardingStepBasicos from "./OnboardingStepBasicos";
import OnboardingStepPersonales from "./OnboardingStepPersonales";
import OnboardingResumen from "./OnboardingResumen";

export default function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(0);
  const [rutina, setRutina] = useState({
    fijos: [],
    basicos: [],
    personales: [],
  });

  const next = () => setStep((s) => s + 1);
  const prev = () => setStep((s) => s - 1);

  return (
    <div>
      {step === 0 && <OnboardingStepFijos value={rutina.fijos} onChange={fijos => { setRutina(r => ({...r, fijos})); next(); }} />}
      {step === 1 && <OnboardingStepBasicos value={rutina.basicos} onChange={basicos => { setRutina(r => ({...r, basicos})); next(); }} prev={prev} />}
      {step === 2 && <OnboardingStepPersonales value={rutina.personales} onChange={personales => { setRutina(r => ({...r, personales})); next(); }} prev={prev} />}
      {step === 3 && <OnboardingResumen rutina={rutina} prev={prev} onComplete={onComplete} />}
    </div>
  );
}

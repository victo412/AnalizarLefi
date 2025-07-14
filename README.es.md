# Lefi Digital Brain — README Técnico (Versión en Español)

---

## 📁 Tabla de contenidos

1. [¿Qué es este proyecto?](#qué-es-este-proyecto)
2. [¿Qué hace actualmente?](#qué-hace-actualmente)
3. [Limitaciones actuales](#limitaciones-actuales)
4. [Stack tecnológico](#stack-tecnológico)
5. [Estructura del proyecto](#estructura-del-proyecto)
6. [Instalación y entorno local](#instalación-y-entorno-local)
7. [Configuración](#configuración)
8. [Despliegue](#despliegue)
9. [Cómo modificar o ampliar](#cómo-modificar-o-ampliar)
10. [Áreas de contribución](#áreas-de-contribución)
11. [Recomendaciones técnicas](#recomendaciones-técnicas)
12. [Capturas de pantalla](#capturas-de-pantalla)

---

## ¿Qué es este proyecto?

**Lefi Digital Brain** es una aplicación web desarrollada con tecnologías modernas del ecosistema frontend. Su objetivo principal es gestionar, visualizar e interactuar con rutinas semanales. Presenta una arquitectura modular con componentes reutilizables que favorecen la escalabilidad y el mantenimiento.

---

## ¿Qué hace actualmente?

* Visualiza y/o gestiona rutinas semanales mediante componentes como `WeeklyRoutineTimeline` y `WeeklyRoutineView`.
* Proporciona una base modular y escalable para el desarrollo frontend ágil.
* Utiliza funcionalidades modernas como recarga en caliente y compilaciones rápidas.

---

## Limitaciones actuales

* ❌ No incluye backend propio ni persistencia de datos.
* ❌ No hay autenticación ni autorización de usuarios.
* ❌ No implementa lógica de negocio avanzada ni gestión de estado global.
* ❌ No existen pruebas automatizadas.
* ❌ No se documentan integraciones con APIs externas (si las hubiera).

---

## 🧱 Stack tecnológico

* **Vite**: Entorno de build ultrarrápido.
* **React + TypeScript**: Interfaz moderna con tipado estático.
* **Tailwind CSS**: Estilos rápidos con utilidades.
* **Estructura modular** en `/src/components/modules`.

**Dependencias clave (por confirmar):**

* React Router (pendiente de confirmar)
* Zustand / Redux (opcional para estado)
* Otros posibles: Axios, React Query, etc.

---

## 📁 Estructura del proyecto

```bash
src/
├── components/
│   └── modules/
│       ├── WeeklyRoutineView.tsx
│       └── WeeklyRoutineTimeline.tsx
├── App.tsx
├── main.tsx
public/
vite.config.ts
tailwind.config.ts
tsconfig.json
```

---

## ⚙️ Instalación y entorno local

```bash
# 1. Clonar el repositorio
git clone https://github.com/tuusuario/lefi-digital-brain.git

# 2. Instalar dependencias
npm install
# o
yarn install

# 3. Ejecutar entorno de desarrollo
npm run dev
# o
yarn dev
```

Accede a la app en [http://localhost:5173](http://localhost:5173)

---

## ⚙️ Configuración

* **Vite**: `vite.config.ts`
* **Tailwind CSS**: `tailwind.config.ts`
* **TypeScript**: `tsconfig.json`

---

## 🚀 Despliegue

Puedes desplegar este proyecto con facilidad en:

### ▶️ Vercel

1. Conecta tu repositorio en [vercel.com](https://vercel.com).
2. Elige framework `Vite`.
3. Comando de build: `vite build`.

### 🌐 Netlify

1. Vincula tu repo en [netlify.com](https://netlify.com).
2. Comando de build: `vite build`
3. Directorio de publicación: `dist`

### 🔧 Despliegue manual

1. Ejecuta: `npm run build`
2. Sube el contenido de la carpeta `/dist` a tu servidor.

---

## 🔧 Cómo modificar o ampliar

* **Nuevos módulos**: Crear componentes en `/src/components/modules`.
* **Estilos personalizados**: Usar clases de Tailwind o modificar `tailwind.config.ts`.
* **Integración backend**: Conectar APIs REST o GraphQL.
* **Gestión de estado**: Incorporar Redux, Zustand o Context API.
* **Internacionalización**: Agregar soporte i18n (ej. `react-i18next`).
* **Pruebas**: Integrar Jest, React Testing Library, etc.

---

## 🙋 Áreas de contribución

¡Contribuciones bienvenidas! Puedes:

* Reportar errores o sugerir mejoras (issues).
* Enviar pull requests.
* Proponer nuevas funcionalidades.

### ¿Cómo empezar?

1. Haz un fork del repositorio.
2. Crea una rama: `feature/mi-feature`.
3. Envía un pull request.

---

## ✅ Recomendaciones técnicas

* **Escalabilidad**: Usa componentes reutilizables y tipado fuerte.
* **Mantenibilidad**: La estructura modular facilita la lectura.
* **Rendimiento**: Vite acelera los tiempos de build.
* **Flexibilidad**: Preparado para crecer e integrarse fácilmente.

---

## 🖼️ Capturas de pantalla

> *(Agrega capturas de la interfaz, diagramas o wireframes. Usa Markdown para insertar:)*

```md
![Vista semanal](./screenshots/weekly-view.png)
```

---

## 🌍 Multilenguaje

Este README está disponible en español e inglés. Puedes colaborar con mejoras o traducciones enviando un PR.

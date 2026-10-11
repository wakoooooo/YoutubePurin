# YoutubePurin

[![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK_57-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/Licencia-Privada-583226)](LICENSE)

Aplicacion movil desarrollada con React Native y Expo para la reproduccion sincronizada de videos de YouTube en tiempo real entre multiples participantes mediante salas privadas con codigo de acceso, chat integrado y una linea estetica visual basada en tonos pastel, trazos suaves y formas organicas redondeadas.

---

## Caracteristicas Principales

- **Salas Privadas por Codigo:** Creacion y acceso rapido a salas mediante codigos alfanumericos unicos (ej. `PURIN-402`).
- **Reproductor de YouTube Embebido:** Integracion directa mediante `react-native-youtube-iframe` y `react-native-webview` con control colaborativo de reproduccion y cambio dinamico de videos.
- **Sincronizacion Temporal con Compensacion de Deriva:** Logica orientada a tolerar desfases minimos (umbral de deriva) para prevenir interrupciones o microcortes por almacenamiento en bufer.
- **Chat en Vivo con Reacciones:** Modulo de mensajeria instantanea con estilo de burbujas tematicas y barra de reacciones interactivas flotantes (Flan, Patita, Huesito y Amor).
- **Sistema Visual y Tokens de Diseno:** Paleta de colores cálida inspirada en tonos flan, caramelo y chocolate con bordes definidos y esquinas redondeadas.

---

## Arquitectura del Proyecto

```
YoutubePurin/
├── assets/
│   └── images/                # Recursos graficos, ilustraciones y logo con transparencia
├── src/
│   ├── components/            # Componentes reutilizables con diseno cute
│   │   ├── ChatBubble.tsx
│   │   ├── PurinButton.tsx
│   │   ├── PurinInput.tsx
│   │   └── YoutubePlayerContainer.tsx
│   ├── screens/               # Vistas principales de navegacion
│   │   ├── JoinRoomScreen.tsx # Acceso y creacion de salas
│   │   └── RoomScreen.tsx     # Reproductor sincronizado y chat activo
│   ├── theme/
│   │   └── colors.ts          # Tokens de diseno, paleta y sombras
│   └── types/
│       └── index.ts           # Modelos y contratos de datos TypeScript
├── App.tsx                    # Punto de entrada y gestion de estado de sala
├── app.json                   # Configuracion de Expo y manifiesto movil
├── package.json               # Dependencias del proyecto
└── tsconfig.json              # Configuracion de TypeScript
```

---

## Flujo de Usuario

1. **Ingreso a la Aplicacion:** El usuario introduce su apodo y puede unirse a una sala existente mediante su codigo de 6 caracteres, o generar una nueva sala indicando opcionalmente un video inicial de YouTube.
2. **Entorno de Sala:** Al acceder, la aplicacion carga el reproductor de video en sincronia, el indicador de estado de los participantes y el canal de conversacion activo.
3. **Interaccion:** Los usuarios pueden compartir mensajes en tiempo real, enviar reacciones animadas sobre la pantalla y coordinar la reproduccion de manera colaborativa.

---

## Instalacion y Ejecucion

### Requisitos Previos

- Node.js (version 20 o superior recomendada).
- Gestor de paquetes npm o yarn.
- Dispositivo movil con la aplicacion **Expo Go** instalada (disponible en Google Play y App Store) o un emulador de Android configurado.

### Pasos de Instalacion

1. Clonar el repositorio o situarse en el directorio del proyecto:
   ```bash
   cd YoutubePurin
   ```

2. Instalar las dependencias del proyecto:
   ```bash
   npm install
   ```

3. Iniciar el servidor de desarrollo de Expo:
   ```bash
   npx expo start
   ```

4. Escanear el codigo QR mostrado en la terminal utilizando la camara del telefono (iOS) o desde la aplicacion Expo Go (Android).

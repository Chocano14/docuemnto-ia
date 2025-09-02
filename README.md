# 📄 Asistente de Documentos Inteligente

> ⚠️ **PROYECTO EN DESARROLLO** - Este proyecto está en fase de desarrollo activo y no está listo para producción.

Un asistente de IA que permite subir documentos PDF y de texto, procesarlos con embeddings de OpenAI, y hacer preguntas sobre su contenido usando búsqueda vectorial en Supabase.

## 🚧 Estado del Proyecto

- **Estado**: En desarrollo activo
- **Versión**: 0.1.0 (Alpha)
- **Completado**: ~60%
- **Última actualización**: Enero 2025

## 🚀 Características Planificadas

- **Subida de documentos**: Soporte para archivos PDF y texto
- **Procesamiento inteligente**: División automática en chunks y generación de embeddings
- **Búsqueda vectorial**: Búsqueda semántica usando pgvector en Supabase
- **Chat interactivo**: Interfaz de chat para hacer preguntas sobre los documentos
- **Citas de fuentes**: Muestra las fuentes utilizadas para cada respuesta
- **Interfaz moderna**: Diseño limpio y responsive con Tailwind CSS

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **IA**: OpenAI GPT-3.5-turbo y text-embedding-3-small
- **Base de datos**: Supabase con PostgreSQL y pgvector
- **Procesamiento de PDF**: pdf-parse

## 📋 Prerrequisitos

- Node.js 18+
- Cuenta de OpenAI con API key
- Proyecto de Supabase con pgvector habilitado

## ⚙️ Configuración Local

### 1. Clonar y instalar dependencias

```bash
git clone https://github.com/Chocano14/docuemnto-ia.git
cd docuemnto-ia
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `env.example` a `.env.local` y configura las variables:

```bash
cp env.example .env.local
```

Edita `.env.local` con tus credenciales (consulta la documentación de OpenAI y Supabase).

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🗄️ Estructura de la Base de Datos

El proyecto utiliza Supabase con PostgreSQL y la extensión pgvector para almacenar embeddings de documentos.

## 🔧 API Endpoints

- `POST /api/upload` - Sube y procesa documentos
- `POST /api/chat` - Chat interactivo con los documentos
- `GET /api/documents` - Lista documentos subidos

## 📁 Estructura del Proyecto

```
src/
├── app/           # Next.js App Router
├── components/    # Componentes React
├── lib/          # Utilidades y configuraciones
└── types/        # Definiciones de TypeScript
```

## 🚀 Roadmap

### Fase 1 (En progreso)
- [x] Configuración básica del proyecto
- [x] Integración con OpenAI
- [x] Integración con Supabase
- [ ] Procesamiento de documentos
- [ ] Interfaz de usuario básica

### Fase 2 (Planificada)
- [ ] Chat interactivo
- [ ] Búsqueda vectorial
- [ ] Gestión de documentos
- [ ] Interfaz de usuario completa

### Fase 3 (Futuro)
- [ ] Autenticación de usuarios
- [ ] Múltiples formatos de documento
- [ ] Exportación de resultados
- [ ] Optimizaciones de rendimiento

## 🐛 Problemas Conocidos

- El proyecto está en desarrollo activo
- Algunas funcionalidades pueden no funcionar correctamente
- La interfaz de usuario está incompleta
- Falta implementar manejo de errores robusto

## 📝 Licencia

MIT License

## 🤝 Contribuciones

Las contribuciones son bienvenidas, pero ten en cuenta que este es un proyecto en desarrollo activo.

## ⚠️ Advertencias

- **No usar en producción**: Este proyecto no está listo para uso en producción
- **Credenciales**: Nunca subas archivos `.env` o credenciales al repositorio
- **Dependencias**: Algunas dependencias pueden tener versiones inestables

## 📞 Contacto

- **Desarrollador**: [Tu Nombre]
- **GitHub**: [@Chocano14](https://github.com/Chocano14)
- **LinkedIn**: [Tu perfil de LinkedIn]

---

*Este proyecto es parte de mi portafolio de desarrollo. Está diseñado para demostrar habilidades en Next.js, TypeScript, IA, y bases de datos vectoriales.*

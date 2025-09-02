# 🔒 Política de Seguridad

## ⚠️ Advertencias Importantes

Este proyecto está en **DESARROLLO ACTIVO** y **NO DEBE USARSE EN PRODUCCIÓN**.

## 🚨 Riesgos de Seguridad

### Credenciales y API Keys
- **NUNCA** subas archivos `.env` o `.env.local` al repositorio
- **NUNCA** incluyas API keys de OpenAI en el código
- **NUNCA** incluyas credenciales de Supabase en el código
- **SIEMPRE** usa variables de entorno para credenciales

### Dependencias
- Algunas dependencias pueden tener versiones inestables
- Revisa regularmente las actualizaciones de seguridad
- Usa `npm audit` para verificar vulnerabilidades

### Base de Datos
- El proyecto usa Supabase (PostgreSQL)
- Asegúrate de configurar correctamente los permisos de usuario
- No expongas credenciales de administrador

## 🛡️ Medidas de Seguridad Implementadas

### Archivos Protegidos
- `.gitignore` configurado para excluir archivos sensibles
- Variables de entorno en archivos separados
- No hay credenciales hardcodeadas en el código

### Configuración de Supabase
- Uso de claves anónimas para operaciones públicas
- Claves de servicio solo para operaciones del servidor
- Permisos de base de datos restringidos

## 📋 Checklist de Seguridad

Antes de hacer commit:
- [ ] No hay archivos `.env` en el staging area
- [ ] No hay API keys en el código
- [ ] No hay credenciales de base de datos
- [ ] Se han revisado las dependencias con `npm audit`

## 🚀 Para Despliegue

### Variables de Entorno Requeridas
```bash
# OpenAI
OPENAI_API_KEY=tu_api_key_aqui

# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_clave_servicio_aqui

# App
NEXT_PUBLIC_APP_URL=tu_url_aqui
```

### Configuración de Vercel
1. Ve a Settings > Environment Variables
2. Agrega cada variable de entorno
3. Asegúrate de que estén marcadas como "Production" y "Preview"

## 📞 Reportar Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad:
1. **NO** abras un issue público
2. Contacta directamente al desarrollador
3. Proporciona detalles específicos del problema

## 🔄 Actualizaciones de Seguridad

- Revisa regularmente las dependencias
- Mantén Next.js actualizado
- Monitorea las notificaciones de seguridad de GitHub
- Usa herramientas como Dependabot para actualizaciones automáticas

---

**Recuerda**: La seguridad es responsabilidad de todos. Siempre revisa tu código antes de hacer commit.

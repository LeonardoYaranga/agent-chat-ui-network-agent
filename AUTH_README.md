# Sistema de Autenticación

Este proyecto ahora incluye un sistema de autenticación completo que protege el acceso al chat y las conversaciones.

## 🔐 Funcionalidades Actuales

### Credenciales Hardcodeadas (Temporal)

Por ahora, el sistema utiliza credenciales hardcodeadas para pruebas:

- **Usuario:** `admin`
- **Contraseña:** `admin123`

### Componentes Implementados

1. **AuthProvider** (`src/providers/Auth.tsx`)

   - Contexto de React para manejar el estado de autenticación
   - Almacenamiento de sesión en localStorage
   - Funciones de login y logout

2. **LoginForm** (`src/components/auth/LoginForm.tsx`)

   - Interfaz de usuario para iniciar sesión
   - Validación de campos
   - Manejo de errores
   - Diseño responsivo con Tailwind CSS

3. **ProtectedRoute** (`src/components/auth/ProtectedRoute.tsx`)

   - Componente de orden superior que protege rutas
   - Redirige al login si no está autenticado
   - Muestra pantalla de carga mientras verifica la sesión

4. **UserMenu** (`src/components/auth/UserMenu.tsx`)
   - Menú de usuario en la interfaz del chat
   - Muestra información del usuario
   - Opción para cerrar sesión

## 🔄 Migración a API de Backend

El sistema está preparado para conectarse con endpoints de un servidor. Aquí está la estructura recomendada:

### Endpoints Necesarios

```typescript
// En src/providers/Auth.tsx están marcados con TODO:

const API_ENDPOINTS = {
  login: "/api/auth/login", // POST - Autenticación
  logout: "/api/auth/logout", // POST - Cierre de sesión
  validateToken: "/api/auth/validate", // GET - Validar token
};
```

### Ejemplo de Implementación con Backend

#### 1. Modificar la función de login

```typescript
const login = async (username: string, password: string) => {
  setIsLoading(true);

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message };
    }

    const data = await response.json();

    // Guardar token y datos del usuario
    const userData: User = {
      username: data.user.username,
      email: data.user.email,
    };

    setUser(userData);
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(userData));

    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al conectar con el servidor" };
  } finally {
    setIsLoading(false);
  }
};
```

#### 2. Agregar validación de token al cargar

```typescript
useEffect(() => {
  const validateSession = async () => {
    const token = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("auth_user");

    if (!token || !savedUser) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/validate", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setUser(JSON.parse(savedUser));
      } else {
        // Token inválido, limpiar sesión
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      }
    } catch (error) {
      console.error("Error validating session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  validateSession();
}, []);
```

#### 3. Crear endpoints en Next.js

Crear archivos en `src/app/api/auth/`:

**`src/app/api/auth/login/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Aquí harías la llamada a tu servidor backend real
    const response = await fetch("https://tu-backend.com/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Credenciales inválidas" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      token: data.token,
      user: data.user,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error del servidor" },
      { status: 500 },
    );
  }
}
```

**`src/app/api/auth/validate/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { message: "No token provided" },
        { status: 401 },
      );
    }

    // Validar el token con tu backend
    const response = await fetch("https://tu-backend.com/api/validate", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ message: "Token inválido" }, { status: 401 });
    }

    const data = await response.json();
    return NextResponse.json({ valid: true, user: data.user });
  } catch (error) {
    return NextResponse.json(
      { message: "Error del servidor" },
      { status: 500 },
    );
  }
}
```

**`src/app/api/auth/logout/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    // Invalidar el token en tu backend
    if (token) {
      await fetch("https://tu-backend.com/api/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { message: "Error del servidor" },
      { status: 500 },
    );
  }
}
```

## 📝 Pasos para Migrar a Backend Real

1. **Reemplazar credenciales hardcodeadas** en `src/providers/Auth.tsx`
2. **Descomentar y configurar** los API_ENDPOINTS
3. **Implementar los endpoints** en `src/app/api/auth/`
4. **Configurar tu servidor backend** con los endpoints correspondientes
5. **Implementar manejo de tokens JWT** (recomendado)
6. **Agregar refresh tokens** para sesiones persistentes
7. **Implementar rate limiting** para prevenir ataques de fuerza bruta

## 🔒 Seguridad Recomendada

- Usar HTTPS en producción
- Implementar tokens JWT con expiración
- Usar httpOnly cookies para tokens (más seguro que localStorage)
- Implementar CSRF protection
- Rate limiting en endpoints de autenticación
- Validación de contraseñas seguras
- Logs de intentos de login
- Two-factor authentication (opcional)

## 🎨 Personalización

Puedes personalizar el diseño del formulario de login editando:

- `src/components/auth/LoginForm.tsx` - Diseño y estilos
- `src/components/auth/UserMenu.tsx` - Menú de usuario
- `src/providers/Auth.tsx` - Lógica de autenticación

## 📱 Flujo Actual

1. Usuario accede a la aplicación
2. Si no está autenticado, ve el formulario de login
3. Ingresa credenciales (admin/admin123)
4. Al autenticarse, puede acceder al chat y conversaciones
5. Puede cerrar sesión desde el menú de usuario
6. La sesión persiste en localStorage (se mantiene al recargar la página)

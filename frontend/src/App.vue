<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="header-content">
        <RouterLink
          to="/solicitudes"
          class="brand"
        >
          <div class="brand-icon">
            TS
          </div>

          <div>
            <strong>
              TechSupport Manager
            </strong>

            <span>
              Gestión de soporte tecnológico
            </span>
          </div>
        </RouterLink>

        <nav class="navigation">
          <RouterLink
            to="/solicitudes"
            class="nav-link"
          >
            Solicitudes
          </RouterLink>

          <RouterLink
            to="/solicitudes/nueva"
            class="nav-link nav-primary"
          >
            + Nueva solicitud
          </RouterLink>
        </nav>
      </div>
    </header>

    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  background: #f3f4f6;
  color: #111827;
}

button,
input,
select,
textarea {
  font-family: inherit;
}

.app-layout {
  min-height: 100vh;
}

.app-header {
  background: #111827;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.header-content {
  max-width: 1400px;
  min-height: 70px;
  margin: 0 auto;
  padding: 0 24px;

  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  text-decoration: none;
}

.brand-icon {
  width: 40px;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background: #2563eb;
  color: white;

  font-size: 13px;
  font-weight: 800;
}

.brand strong {
  display: block;
  font-size: 16px;
}

.brand span {
  display: block;
  margin-top: 2px;

  color: #9ca3af;
  font-size: 12px;
}

.navigation {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  padding: 9px 13px;

  border-radius: 7px;

  color: #d1d5db;
  text-decoration: none;

  font-size: 14px;
  font-weight: 600;
}

.nav-link:hover {
  background: #1f2937;
  color: white;
}

.nav-primary {
  background: #2563eb;
  color: white;
}

.nav-primary:hover {
  background: #1d4ed8;
}

.app-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 24px;
}

@media (max-width: 700px) {
  .header-content {
    padding: 12px 16px;
    flex-direction: column;
    align-items: stretch;
  }

  .navigation {
    width: 100%;
  }

  .nav-link {
    flex: 1;
    text-align: center;
  }

  .app-main {
    padding: 20px 16px;
  }
}
</style>
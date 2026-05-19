<script>
export default {
  name: "NavBar",
  data() {
    return {
      isMobileMenuOpen: false,
      currentPath: "/",
    };
  },
  watch: {
    $route: {
      handler() {
        this.currentPath = this.$route.path;
        this.isMobileMenuOpen = false;
      },
    },
  },
  methods: {
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    },
    closeMobileMenu() {
      this.isMobileMenuOpen = false;
    },
    isActive(path) {
      return this.currentPath === path;
    },
  },
};
</script>

<template>
  <!-- Desktop Navigation -->
  <nav class="navbar navbar-desktop" aria-label="Navigation principale">
    <div class="navbar-container">
      <div class="navbar-brand">
        <router-link to="/" class="brand-link">Meditrack</router-link>
      </div>
      <ul class="navbar-menu">
        <li>
          <router-link
            to="/"
            class="nav-link"
            :class="{ active: isActive('/') }"
            aria-current="page"
          >
            Accueil
          </router-link>
        </li>
        <li>
          <router-link
            to="/steps"
            class="nav-link"
            :class="{ active: isActive('/steps') }"
            aria-current="page"
          >
            Étapes
          </router-link>
        </li>
        <li>
          <router-link
            to="/appointments"
            class="nav-link"
            :class="{ active: isActive('/appointments') }"
            aria-current="page"
          >
            Rendez-vous
          </router-link>
        </li>
        <li>
          <router-link
            to="/documents"
            class="nav-link"
            :class="{ active: isActive('/documents') }"
            aria-current="page"
          >
            Documents
          </router-link>
        </li>
        <li>
          <router-link
            to="/profile"
            class="nav-link"
            :class="{ active: isActive('/profile') }"
            aria-current="page"
          >
            Profil
          </router-link>
        </li>
      </ul>
    </div>
  </nav>

  <!-- Mobile Navigation -->
  <nav class="navbar navbar-mobile" aria-label="Navigation mobile">
    <div class="navbar-mobile-content">
      <router-link
        to="/"
        class="nav-link-mobile"
        :class="{ active: isActive('/') }"
        aria-label="Accueil"
      >
        <i class="fa-solid fa-lg fa-house-chimney"></i>
        <span class="label">Accueil</span>
      </router-link>

      <router-link
        to="/steps"
        class="nav-link-mobile"
        :class="{ active: isActive('/steps') }"
        aria-label="Étapes"
      >
        <i class="fa-solid fa-lg fa-list-ul"></i>
        <span class="label">Étapes</span>
      </router-link>

      <router-link
        to="/appointments"
        class="nav-link-mobile"
        :class="{ active: isActive('/appointments') }"
        aria-label="Rendez-vous"
      >
        <i class="fa-solid fa-lg fa-calendar"></i>
        <span class="label">RDV</span>
      </router-link>

      <router-link
        to="/documents"
        class="nav-link-mobile"
        :class="{ active: isActive('/documents') }"
        aria-label="Documents"
      >
        <i class="fa-solid fa-lg fa-file"></i>
        <span class="label">Documents</span>
      </router-link>

      <router-link
        to="/profile"
        class="nav-link-mobile"
        :class="{ active: isActive('/profile') }"
        aria-label="Profil"
      >
        <i class="fa-solid fa-lg fa-circle-user"></i>
        <span class="label">Profil</span>
      </router-link>
    </div>
  </nav>
</template>

<style scoped>
/* Desktop Navigation */
.navbar-desktop {
  display: none;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid #e0e0e0;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.navbar-brand {
  flex-shrink: 0;
}

.brand-link {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a73e8;
  text-decoration: none;
  transition: color 0.3s ease;
}

.brand-link:hover,
.brand-link:focus {
  color: #1557b0;
  outline: none;
}

.navbar-menu {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 30px;
}

.nav-link {
  color: #333;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 8px 12px;
  border-radius: 4px;
  position: relative;
}

.nav-link:hover,
.nav-link:focus {
  color: #1a73e8;
  outline: none;
}

.nav-link.active {
  color: #1a73e8;
  font-weight: 600;
}

.nav-link.active::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 12px;
  right: 12px;
  height: 3px;
  background-color: #1a73e8;
  border-radius: 2px;
}

/* Mobile Navigation */
.navbar-mobile {
  display: flex;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  border-top: 1px solid #e0e0e0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.navbar-mobile-content {
  display: flex;
  width: 100%;
  justify-content: space-around;
  align-items: center;
}

.nav-link-mobile {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  padding: 12px 8px;
  min-height: 70px;
  color: #666;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  border-radius: 0;
}

.nav-link-mobile:hover,
.nav-link-mobile:focus {
  color: #1a73e8;
  outline: none;
}

.nav-link-mobile.active {
  color: #1a73e8;
  background-color: #f0f7ff;
}

.nav-link-mobile.active::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: #1a73e8;
}

.icon {
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
}

.label {
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
}

/* Responsive Breakpoints */
@media (max-width: 768px) {
  .navbar-desktop {
    display: none !important;
  }

  .navbar-mobile {
    display: flex;
  }

  body {
    padding-bottom: 70px;
  }
}

@media (min-width: 769px) {
  .navbar-desktop {
    display: block;
  }

  .navbar-mobile {
    display: none;
  }

  body {
    padding-bottom: 0;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .nav-link,
  .nav-link-mobile,
  .brand-link {
    transition: none;
  }
}

/* Focus visible for keyboard navigation */
.nav-link:focus-visible,
.nav-link-mobile:focus-visible,
.brand-link:focus-visible {
  outline: 2px solid #1a73e8;
  outline-offset: 2px;
}
</style>

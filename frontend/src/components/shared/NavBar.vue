<script>
import { useAuth } from "@/composables/useAuth.js";
import { ROLES } from "@/constants/roles.js";

export default {
  name: "NavBar",
  data() {
    return {
      isMobileMenuOpen: false,
      currentPath: "/",
    };
  },
  methods: {
    isActive(path) {
      return this.$route.path === path;
    },
    getMenu() {
      const { userRole } = useAuth();
      const isPatient = userRole.value === ROLES.PATIENT;
      const isDoctor = userRole.value === ROLES.DOCTOR;
      const isAssistant = userRole.value === ROLES.ASSISTANT;
      const isSuperAdmin = userRole.value === ROLES.SUPERADMIN;

      return [
        {
          link: "/",
          title: "Accueil",
          label: "home",
          icon: "fa-house-chimney",
          isDisplayed: true,
        },
        {
          link: "/patients",
          title: "Patients",
          label: "patients",
          icon: "fa-users",
          isDisplayed: isDoctor
        },
        {
          link: "/assistant",
          title: "Patients",
          label: "patients",
          icon: "fa-users",
          isDisplayed: isAssistant,
        },
        {
          link: "/steps",
          title: "Étapes",
          label: "steps",
          icon: "fa-list-ul",
          isDisplayed: isPatient,
        },
        {
          link: "/appointments",
          title: "RDV",
          label: "rdv",
          icon: "fa-calendar",
          isDisplayed: isPatient,
        },
        {
          link: "/documents",
          title: "Documents",
          label: "docs",
          icon: "fa-file",
          isDisplayed: isPatient,
        },
        {
          link: "/admin",
          title: "Admin",
          label: "admin",
          icon: "fa-user-gear",
          isDisplayed: isSuperAdmin,
        },
        {
          link: "/profile",
          title: "Profil",
          label: "profile",
          icon: "fa-circle-user",
          isDisplayed: true,
        },
      ];
    },
  },
};
</script>

<template>
  <!-- Desktop Navigation -->
  <nav class="navbar navbar-desktop" aria-label="Navigation principale">
    <div class="navbar-container">
      <router-link to="/" class="brand-link"
        ><img src="@/assets/meditrack-logo-text.svg" alt="Logo Meditrack"
      /></router-link>
      <ul class="navbar-menu">
        <li v-for="menu in getMenu()" :key="menu.label" v-show="menu.isDisplayed">
          <router-link
            :to="menu.link"
            class="nav-link"
            :class="{ active: isActive(menu.link) }"
            :aria-current="menu.label"
          >
            {{ menu.title }}
          </router-link>
        </li>
      </ul>
    </div>
  </nav>

  <!-- Mobile Navigation -->
  <nav class="navbar navbar-mobile" aria-label="Navigation mobile">
    <div class="navbar-mobile-content">
      <router-link
        v-for="menu in getMenu()"
        :key="menu.label"
        :to="menu.link"
        class="nav-link-mobile"
        :class="{ active: isActive(menu.link) }"
        :aria-label="menu.label"
        v-show="menu.isDisplayed"
      >
        <i :class="`fa-solid fa-lg ${menu.icon}`"></i>
        <span>{{ menu.title }}</span>
      </router-link>
    </div>
  </nav>
</template>

<style scoped>
/* Desktop Navigation */
.navbar-desktop {
  display: none;
  background-color: var(--color-white);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--color-gray-light);
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

.brand-link img {
  height: 33px;
  width: auto;
}

.navbar-menu {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 30px;
}

.nav-link {
  color: var(--color-gray-dark);
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
  color: var(--color-primary-hover);
  outline: none;
}

.nav-link.active {
  color: var(--color-primary-dark);
}

.nav-link.active::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 6px;
  right: 6px;
  height: 3px;
  background-color: var(--color-primary-dark);
  border-radius: 2px;
}

/* Mobile Navigation */
.navbar-mobile {
  display: flex;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--color-white);
  border-top: 1px solid var(--color-gray-light);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.navbar-mobile-content {
  display: flex;
  height: 70px;
  width: 100%;
  justify-content: space-around;
  align-items: center;
}

.nav-link-mobile {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: var(--color-gray);
  gap: 12px;
}

.nav-link-mobile:hover,
.nav-link-mobile:focus {
  color: var(--color-primary-hover);
  outline: none;
}

.nav-link-mobile.active {
  color: var(--color-primary-hover);
  background-color: var(--color-success-bg);
}

.nav-link-mobile span {
  text-align: center;
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

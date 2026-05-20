<script>
import { useAuth } from '@/composables/useAuth.js';
import { ROLES } from '@/constants/roles.js';

export default {
  name: 'NavBar',
  setup() {
    const { userRole } = useAuth();
    return { userRole };
  },
  computed: {
    menu() {
      const isPatient = this.userRole === ROLES.PATIENT;
      const isDoctor = this.userRole === ROLES.DOCTOR;
      const isAssistant = this.userRole === ROLES.ASSISTANT;
      const isSuperAdmin = this.userRole === ROLES.SUPER_ADMIN;
      const isAide = this.userRole === ROLES.AIDE;

      return [
        {
          link: '/',
          title: 'Accueil',
          pageTitle: 'Accueil',
          label: 'home',
          icon: 'fa-house-chimney',
          isDisplayed: true,
          isPageTitleDisplayedMobile: true,
        },
        {
          link: "/add-patient",
          title: "Ajouter un patient",
          label: "add-patient-doctor",
          icon: "fa-user-plus",
          isDisplayed: isDoctor,
        },
        {
          link: "/add-patient",
          title: "Ajouter un patient",
          label: "add-patient-assistant",
          icon: "fa-user-plus",
          isDisplayed: isAssistant,
        },
        {
          link: '/patients',
          title: 'Patients',
          pageTitle: 'Patients',
          label: 'patients',
          icon: 'fa-users',
          isDisplayed: isDoctor,
          isPageTitleDisplayedMobile: true,
        },
        {
          link: '/search-patients',
          title: 'Rechercher',
          pageTitle: 'Rechercher',
          label: 'search',
          icon: 'fa-magnifying-glass',
          isDisplayed: isDoctor,
          isPageTitleDisplayedMobile: true,
        },
        {
          link: "/add-patient",
          title: "Ajouter un patient",
          label: "add-patient",
          icon: "fa-user-plus",
          isDisplayed: isAssistant,
        },
        {
          link: '/assistant',
          title: 'Patients',
          pageTitle: 'Patients',
          label: 'patients',
          icon: 'fa-users',
          isDisplayed: isAssistant,
          isPageTitleDisplayedMobile: true,
        },
        {
          link: '/aide',
          title: 'Mes patients',
          pageTitle: 'Mes patients',
          label: 'aide',
          icon: 'fa-hand-holding-heart',
          isDisplayed: isAide,
          isPageTitleDisplayedMobile: true,
        },
        /*         {
          link: '/steps',
          title: 'Étapes',
          pageTitle: 'Étapes',
          label: 'steps',
          icon: 'fa-list-ul',
          isDisplayed: isPatient,
          isPageTitleDisplayedMobile: true,
        },
        }, */
        {
          link: '/appointments',
          title: 'RDV',
          pageTitle: 'Vos Rendez-Vous',
          label: 'rdv',
          icon: 'fa-calendar',
          isDisplayed: isPatient,
          isPageTitleDisplayedMobile: true,
        },
        {
          link: '/admin',
          title: 'Admin',
          pageTitle: 'Admin',
          label: 'admin',
          icon: 'fa-user-gear',
          isDisplayed: isSuperAdmin,
          isPageTitleDisplayedMobile: true,
        },
        {
          link: '/contact',
          title: 'Contact',
          pageTitle: 'Contact',
          label: 'contact',
          icon: 'fa-phone',
          isDisplayed: isPatient || isAide,
          isPageTitleDisplayedMobile: true,
        },
        {
          link: '/profile',
          title: 'Profil',
          pageTitle: 'Profil',
          label: 'profile',
          icon: 'fa-circle-user',
          isDisplayed: true,
          isPageTitleDisplayedMobile: false,
        },
      ];
    },
    currentPage() {
      return this.menu.find((item) => item.link === this.$route.path);
    },
  },
  methods: {
    isActive(path) {
      return this.$route.path === path;
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
        <li v-for="item in menu" :key="item.label" v-show="item.isDisplayed">
          <router-link
            :to="item.link"
            class="nav-link"
            :class="{ active: isActive(item.link) }"
            :aria-current="item.label"
          >
            {{ item.title }}
          </router-link>
        </li>
      </ul>
    </div>
  </nav>

  <!-- Mobile Navigation -->
  <header
    v-show="currentPage?.isPageTitleDisplayedMobile"
    class="header-mobile"
    aria-label="En-tête mobile"
  >
    {{ currentPage?.pageTitle ?? '' }}
  </header>

  <nav class="navbar navbar-mobile" aria-label="Navigation mobile">
    <div class="navbar-mobile-content">
      <router-link
        v-for="item in menu"
        :key="item.label"
        :to="item.link"
        class="nav-link-mobile"
        :class="{ active: isActive(item.link) }"
        :aria-label="item.label"
        v-show="item.isDisplayed"
      >
        <i :class="`fa-solid fa-lg ${item.icon}`"></i>
        <span>{{ item.title }}</span>
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
  content: '';
  position: absolute;
  bottom: -1px;
  left: 6px;
  right: 6px;
  height: 3px;
  background-color: var(--color-primary);
  border-radius: 2px;
}

/* Mobile Navigation */
.header-mobile {
  display: none;
  align-items: center;
  padding: 0 16px;
  height: 56px;
  color: var(--color-white);
  background-color: var(--color-primary);
  border-bottom: 1px solid var(--color-gray-light);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-mobile-title {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-gray-dark);
}

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
  color: var(--color-gray-dark);
  gap: 12px;
}

.nav-link-mobile:hover,
.nav-link-mobile:focus {
  color: var(--color-primary-hover);
  outline: none;
}

.nav-link-mobile.active {
  color: var(--color-primary-hover);
  background-color: var(--color-primary-background);
}

.nav-link-mobile span {
  text-align: center;
}

/* Responsive Breakpoints */
@media (max-width: 768px) {
  .header-mobile {
    display: flex;
  }

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
  .header-mobile {
    display: flex;
  }

  .navbar-desktop {
    display: block;
  }

  .navbar-mobile {
    display: none;
  }

  body {
    padding-bottom: 0;
  }

  .header-mobile {
    display: none;
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

.nav-link:focus-visible,
.nav-link-mobile:focus-visible,
.brand-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>

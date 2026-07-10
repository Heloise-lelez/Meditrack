<template>
  <AuthComponent v-if="showAuth" />

  <div v-else class="meditrack">
    <!-- Header -->
    <header class="header">
      <div class="header__inner">
        <a href="#" class="logo">
          <span class="logo__ring"></span>
          Meditrack
        </a>

        <nav class="nav" :class="{ 'nav--open': menuOpen }">
          <button type="button" class="link-ghost nav-link-btn" @click="openAuth">
            Se connecter
          </button>
          <button type="button" class="btn btn--primary" @click="openAuth">
            Prendre rendez-vous
          </button>
        </nav>

        <div class="header__actions">
          <button type="button" class="link-ghost" @click="openAuth">Se connecter</button>
          <button type="button" class="btn btn--primary" @click="openAuth">
            Prendre rendez-vous
          </button>
        </div>

        <button
          class="burger"
          @click="menuOpen = !menuOpen"
          :aria-expanded="menuOpen"
          aria-label="Ouvrir le menu"
        >
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>

    <main>
      <!-- Hero -->
      <section class="hero">
        <div class="hero__text">
          <p class="eyebrow">Oncologie · Suivi coordonné</p>
          <h1>
            Un rendez-vous pris<br />
            avec <em>la bonne personne</em>,<br />
            au bon moment.
          </h1>
          <p class="hero__lead">
            Meditrack met en relation les patients avec les secrétariats et les médecins
            d'oncologie, pour organiser un rendez-vous sans dizaines d'appels ni temps d'attente
            inutile.
          </p>
          <div class="hero__actions">
            <button type="button" class="btn btn--primary btn--lg" @click="openAuth">
              Prendre rendez-vous
            </button>
            <a href="#comment-ca-marche" class="btn btn--outline btn--lg">Voir comment ça marche</a>
          </div>
          <p class="hero__note">Conçu avec des oncologues et des secrétariats médicaux.</p>
        </div>

        <div class="hero__visual" aria-hidden="true">
          <div class="meditrack-rings">
            <span class="ring ring--1"></span>
            <span class="ring ring--2"></span>
            <span class="ring ring--3"></span>
          </div>

          <div class="appt-card">
            <div class="appt-card__top">
              <span class="avatar">AL</span>
              <div>
                <p class="appt-card__name">Dr Amélie Laurent</p>
                <p class="appt-card__role">Oncologie médicale</p>
              </div>
            </div>
            <div class="appt-card__divider"></div>
            <div class="appt-card__row">
              <span class="tag tag--slot">Jeudi 9 juillet</span>
              <span class="tag tag--slot">14h30</span>
            </div>
            <p class="appt-card__patient">Rendez-vous pour Nadia B.</p>
          </div>
        </div>
      </section>

      <!-- CTA final -->
      <section id="rdv" class="cta">
        <div class="cta__card">
          <h2>Besoin d'un rendez-vous en oncologie ?</h2>
          <p>Meditrack vous met en relation avec le bon interlocuteur, rapidement.</p>
          <button type="button" class="btn btn--white btn--lg" @click="openAuth">
            Prendre rendez-vous
          </button>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="footer__inner">
        <p class="footer__legal">© {{ year }} Meditrack. Tous droits réservés.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AuthComponent from '@/components/auth/auth-component.vue';

const menuOpen = ref(false);
const showAuth = ref(false);
const year = new Date().getFullYear();

function openAuth() {
  showAuth.value = true;
  menuOpen.value = false;
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');

.meditrack {
  --font-display: 'Fraunces', serif;
  --font-body: 'Inter', sans-serif;
  --radius-lg: 24px;
  --radius-full: 999px;
  --header-h: 76px;

  font-family: var(--font-body);
  color: var(--color-black);
  background: var(--color-white);
  overflow-x: hidden;
}

.meditrack h1,
.meditrack h2,
.meditrack h3 {
  font-family: var(--font-display);
  color: var(--color-black);
  line-height: 1.15;
  font-weight: 600;
}

.meditrack em {
  font-style: normal;
  color: var(--color-primary);
}

/* ---------- Buttons & links ---------- */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: var(--radius-full);
  padding: 12px 22px;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}
.btn:hover {
  transform: translateY(-1px);
}
.btn:active {
  transform: translateY(0);
}
.btn:focus-visible {
  outline: 3px solid var(--color-primary-focus);
  outline-offset: 2px;
}

.btn--primary {
  background: var(--color-primary);
  color: var(--color-white);
}
.btn--primary:hover {
  background: var(--color-primary-hover);
}

.btn--secondary {
  background: var(--color-secondary-background);
  color: var(--color-secondary);
}
.btn--secondary:hover {
  background: var(--color-secondary);
  color: var(--color-white);
}

.btn--outline {
  background: transparent;
  color: var(--color-primary);
  box-shadow: inset 0 0 0 1.5px var(--color-primary);
}
.btn--outline:hover {
  background: var(--color-primary-background);
}

.btn--white {
  background: var(--color-white);
  color: var(--color-primary);
}
.btn--white:hover {
  background: var(--color-off-white);
}

.btn--lg {
  padding: 15px 28px;
  font-size: 1rem;
}

/* reset pour les <button> utilisés comme des liens/CTA (Se connecter, etc.) */
.link-ghost,
.nav-link-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  color: var(--color-gray-dark);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  padding: 0;
}
.link-ghost:hover,
.nav-link-btn:hover {
  color: var(--color-primary);
}

/* ---------- Header ---------- */
.header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-gray-light);
}

.header__inner {
  height: var(--header-h);
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 32px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-primary-dark);
  text-decoration: none;
}

.logo__ring {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 3px solid var(--color-primary);
  box-shadow: 0 0 0 4px var(--color-primary-background);
}

.nav {
  display: none; /* caché par défaut, y compris desktop */
  align-items: center;
  gap: 28px;
}

.header__actions {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-left: auto; /* pousse les boutons à droite */
}
.burger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
}
.burger span {
  height: 2px;
  background: var(--color-black);
  border-radius: 2px;
}

/* ---------- Hero ---------- */
.hero {
  max-width: 1200px;
  margin: 0 auto;
  padding: 72px 24px 96px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
}

.eyebrow {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-secondary);
  margin-bottom: 16px;
}
.eyebrow--center {
  text-align: center;
}

.hero__text h1 {
  font-size: clamp(2.1rem, 3.6vw, 3.1rem);
  margin-bottom: 22px;
}

.hero__lead {
  font-size: 1.1rem;
  color: var(--color-gray-dark);
  max-width: 46ch;
  margin-bottom: 32px;
}

.hero__actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.hero__note {
  font-size: 0.85rem;
  color: var(--color-gray);
}

.hero__visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 420px;
}

.meditrack-rings {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ring {
  position: absolute;
  border-radius: 50%;
  border: 1.5px solid;
  opacity: 0.35;
}
.ring--1 {
  width: 260px;
  height: 260px;
  border-color: var(--color-primary);
  animation: pulse 7s ease-in-out infinite;
}
.ring--2 {
  width: 360px;
  height: 360px;
  border-color: var(--color-secondary);
  animation: pulse 7s ease-in-out infinite 1.2s;
}
.ring--3 {
  width: 460px;
  height: 460px;
  border-color: var(--color-active);
  animation: pulse 7s ease-in-out infinite 2.4s;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.25;
  }
  50% {
    transform: scale(1.04);
    opacity: 0.45;
  }
}

.appt-card {
  position: relative;
  z-index: 1;
  width: 300px;
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: 0 20px 45px rgba(79, 32, 67, 0.14);
}

.appt-card__top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--color-primary-background);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
}

.appt-card__name {
  font-weight: 600;
  font-size: 0.95rem;
}
.appt-card__role {
  font-size: 0.8rem;
  color: var(--color-gray);
}

.appt-card__divider {
  height: 1px;
  background: var(--color-gray-light);
  margin-bottom: 16px;
}

.appt-card__row {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.tag {
  font-size: 0.78rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: var(--radius-full);
}
.tag--slot {
  background: var(--color-secondary-background);
  color: var(--color-secondary);
}

.appt-card__patient {
  font-size: 0.85rem;
  color: var(--color-gray-dark);
  margin-bottom: 16px;
}

/* ---------- CTA ---------- */
.cta {
  padding: 0 24px 96px;
}
.cta__card {
  max-width: 1000px;
  margin: 0 auto;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  border-radius: var(--radius-lg);
  padding: 64px 40px;
  text-align: center;
  color: var(--color-white);
}
.cta__card h2 {
  color: var(--color-white);
  font-size: clamp(1.6rem, 2.6vw, 2.2rem);
  margin-bottom: 12px;
}
.cta__card p {
  margin-bottom: 28px;
  opacity: 0.9;
}

/* ---------- Footer ---------- */
.footer {
  background: var(--color-primary-dark);
  color: rgba(255, 255, 255, 0.75);
  padding: 40px 18px;
}
.footer__inner {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

/* ---------- Responsive ---------- */
@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
  }
  .hero__visual {
    order: -1;
    min-height: 340px;
  }
}

@media (max-width: 768px) {
  .header__actions {
    display: none;
  }
  .burger {
    display: flex;
  }

  .nav--open {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    position: absolute;
    top: var(--header-h);
    left: 0;
    right: 0;
    background: var(--color-white);
    padding: 20px 24px;
    border-bottom: 1px solid var(--color-gray-light);
    gap: 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ring {
    animation: none;
  }
  .btn {
    transition: none;
  }
}
</style>

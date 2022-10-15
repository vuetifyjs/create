<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex align-center text-center fill-height">
      <v-img
        class="mb-12"
        contain
        height="300"
        src="src/assets/logo.svg"
      />

      <h1 class="text-h2 font-weight-bold mb-16">Welcome</h1>

      <div class="d-flex align-center justify-center">
        <v-btn
          href="https://next.vuetifyjs.com/components/all/"
          min-width="228"
          size="x-large"
          variant="text"
        >
          <v-icon
            icon="mdi-view-dashboard"
            size="large"
            start
          />

          Components
        </v-btn>

        <span class="mx-4">•</span>

        <v-btn
          href="https://next.vuetifyjs.com/introduction/why-vuetify/#feature-guides"
          min-width="228"
          size="x-large"
          target="_blank"
          variant="text"
        >
          <v-icon
            icon="mdi-vuetify"
            size="large"
            start
          />

          Get Started
        </v-btn>

        <span class="mx-4">•</span>

        <v-btn
          href="https://community.vuetifyjs.com/"
          min-width="228"
          size="x-large"
          target="_blank"
          variant="text"
        >
          <v-icon
            icon="mdi-account-group"
            size="large"
            start
          />

          Community
        </v-btn>
      </div>
    </v-responsive>
  </v-container>
</template>

<script setup>

</script>

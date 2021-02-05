<template>
  <v-app dark>
    <v-main>
      <v-container fill-height fluid>
        <nuxt />
      </v-container>
    </v-main>
    <Footer class="mt-12" />
  </v-app>
</template>

<script>
import Footer from '~/components/Footer'
export default {
  components: {
    Footer,
  },
  data() {
    return {}
  },
}
</script>

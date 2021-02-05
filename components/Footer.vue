<template>
  <v-footer color="grey lighten-2" :absolute="true" app>
    <v-container >
      <v-row>
        <v-col cols="6" class="mt-3"> <Logo style="max-height: 50px;" /> </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script>
import Logo from '~/components/Logo'
export default {
  components: {
    Logo,
  },
}
</script>

<style>
</style>
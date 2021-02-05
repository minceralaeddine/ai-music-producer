<template>
  <v-overlay v-if="learning" class="text-center" opacity="1" color="white">
    <v-scroll-y-reverse-transition>
      <v-col v-show="learning"  cols="3" align="center" class="mt-n16 mx-auto">
        <v-sparkline
          :value="value"
          :gradient="gradient"
          :smooth="radius || false"
          :padding="padding"
          :line-width="width"
          :stroke-linecap="lineCap"
          :gradient-direction="gradientDirection"
          :fill="fill"
          :type="type"
          :auto-line-width="autoLineWidth"
          auto-draw
        ></v-sparkline>
      </v-col>
    </v-scroll-y-reverse-transition>
    <v-scroll-y-reverse-transition>
      <h1 v-show="learning" class="display-3 my-10 primary--text font-weight-black">
        Martin is learning...
      </h1>
    </v-scroll-y-reverse-transition>
    <v-scroll-y-reverse-transition>
      <h1 v-show="learning" class="display-1 primary--text font-weight-light">Please Wait</h1>
    </v-scroll-y-reverse-transition>
  </v-overlay>
</template>

<script>
import { mapGetters } from 'vuex'
const gradients = [
  ['violet', 'purple', 'red', 'orange'],
  ['violet', 'purple', 'red', 'orange'],
  ['violet', 'purple', 'red', 'orange'],
  ['violet', 'purple', 'red', 'orange'],
  ['violet', 'purple', 'red', 'orange'],
  ['violet', 'purple', 'red', 'orange'],
]

export default {
  data: () => ({
    width: 5,
    radius: 1000,
    padding: 8,
    lineCap: 'round',
    gradient: gradients[5],
    value: [1, -1, 1, -1, 1],
    gradientDirection: 'top',
    gradients,
    fill: false,
    type: 'trend',
    autoLineWidth: false,
  }),
  computed: {
    ...mapGetters({
      learning: 'learning',
      playing: 'playing',
      generating: 'generating',
    }),
  },
}
</script>

<style>
</style>
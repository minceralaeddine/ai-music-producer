<template>
  <v-container fluid fill-height>
    <v-slide-x-reverse-transition hide-on-leave leave-absolute>
      <v-row v-show="welcomeScreen" align="center" justify="center">
        <v-col cols="12" align="center">
          <h1 class="primary--text display-1">Welcome to</h1>
        </v-col>
        <v-col cols="12" md="6" class="mx-auto my-16">
          <Logo />
        </v-col>
        <v-col align="center" cols="12">
          <v-btn @click="welcomeScreen = false" x-large color="primary"
            >Get Started</v-btn
          >
        </v-col>
      </v-row>
    </v-slide-x-reverse-transition>
    <v-scroll-x-transition hide-on-leave>
      <v-row v-if="!samples && !welcomeScreen" justify="center" align="center">
        <v-col cols="12" align="center">
          <h1 class="display-4 primary--text font-weight-bold">
            Let's have some fun!
          </h1>
        </v-col>

        <v-card flat class="my-12 pa-12">
          <v-card-title class="pb-12 px-0">
            <h1 class="display-2 font-weight-bold primary--text">
              Start by uploading your MIDI file
            </h1></v-card-title
          >
          <v-file-input
            color="primary"
            placeholder="Upload file"
            outlined
            :prepend-icon="null"
            prepend-inner-icon="mdi-music-note"
            v-model="midiInput"
            :error="!!error"
            :error-messages="error"
          />
          <v-card-actions class="px-0">
            <v-btn
              x-large
              block
              color="primary"
              @click="initTrain"
              :disabled="!midiInput || !!error"
              >Generate Similar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-row>
    </v-scroll-x-transition>
    <!-- <v-row v-if="originalMelody">
      <SamplePlayer disable-download :sample="sample" :sample-name="i" />
    </v-row> -->
    <v-scroll-x-transition hide-on-leave>
      <v-row v-if="samples && !welcomeScreen" class="mx-16">
        <v-col cols="4" align="center">
          <v-row class="mb-16" justify="center" align="center">
            <v-fade-transition hide-on-leave>
              <h1 class="display-2 primary--text font-weight-bold">
                Your Sample
              </h1>
            </v-fade-transition>
          </v-row>
          <v-row justify="center" align="center">
            <v-col cols="12">
              <SamplePlayer
                disable-download
                disable-retrain
                :sample="inputMelodies"
                :sample-name="midiInput.name"
              ></SamplePlayer>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="8" align="center">
          <v-row class="mb-16" justify="center" align="center">
            <v-fade-transition hide-on-leave>
              <h1
                v-if="!downloaded"
                class="display-2 primary--text font-weight-bold"
              >
                Martin's Samples
              </h1>
            </v-fade-transition>

            <v-fade-transition hide-on-leave>
              <h1
                v-if="downloaded"
                class="display-4 primary--text font-weight-bold"
              >
                I'm flattered! 🥰
              </h1>
            </v-fade-transition>
          </v-row>
          <v-row justify="center" align="center">
            <v-col cols="12">
              <SamplePlayer
                width="100%"
                class="mb-2"
                v-for="(sample, i) in samples"
                :key="i"
                @download="downloaded = true"
                @play="downloaded = false"
                @retrain="retrainBasedOnSample"
                :sample="sample"
                :sample-name="i"
              />
            </v-col>
          </v-row>
        </v-col>
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              class="mb-5"
              fab
              absolute
              right
              bottom
              x-large
              v-bind="attrs"
              v-on="on"
              color="primary"
              @click="startOver"
            >
              <v-icon color="white">mdi-restart</v-icon>
            </v-btn>
          </template>
          <span>Start Over</span>
        </v-tooltip>
      </v-row>
    </v-scroll-x-transition>
    <training-overlay />
    <generating-overlay />
  </v-container>
</template>

<script>
// import { model, player } from '@/plugins/magenta'
import { mvae, midime } from '@/plugins/magenta'
import SamplePlayer from '~/components/SamplePlayer'
import { mapGetters } from 'vuex'
import TrainingOverlay from '~/components/TrainingOverlay.vue'
import GeneratingOverlay from '~/components/GeneratingOverlay.vue'
import { Midi } from '@tonejs/midi'
import Logo from '~/components/Logo'

export default {
  components: {
    SamplePlayer,
    TrainingOverlay,
    GeneratingOverlay,
    Logo,
  },
  data() {
    return {
      MEL_BARS: 16,
      TRIO_BARS: 4,
      midiInput: undefined,
      inputMelodies: undefined,
      samples: undefined,
      training: false,
      originalMelody: undefined,
      originalMelodyName: undefined,
      error: undefined,
      downloaded: false,
      welcomeScreen: true,
    }
  },
  computed: {
    ...mapGetters({
      learning: 'learning',
      playing: 'playing',
      generating: 'generating',
    }),
  },
  methods: {
    async initTrain() {
      midime.initialize()
      if (this.midiInput) {
        this.error = null
        await this.loadFile(this.midiInput, 'mel')
        this.trainMelody()
      } else {
        this.error = 'Please upload a file.'
      }
    },

    async loadFile(file, prefix) {
      // if (prefix === 'mel') {
      this.inputMelodies = await core.blobToNoteSequence(file)
      // } else {
      //   inputTrios = await core.blobToNoteSequence(file)
      // }
    },

    async trainMelody() {
      this.samples = await this.train(this.inputMelodies, mvae, midime, 'mel')
    },

    async retrainBasedOnSample(sample) {
      // const retrain = await core.blobToNoteSequence(sample);
      this.samples = await this.train(sample, mvae, midime, 'mel')
    },

    async train(mel, vae, midime, prefix) {
      this.$store.commit('setLearning', true)
      const start = performance.now()
      // 1. Encode the input into MusicVAE, get back a z.
      const quantizedMels = []
      quantizedMels.push(core.sequences.quantizeNoteSequence(mel, 4))

      // 1b. Split this sequence into 32 bar chunks.
      let chunks = []
      quantizedMels.forEach((m) => {
        const length =
          prefix === 'mel' ? 16 * this.MEL_BARS : 16 * this.TRIO_BARS
        const melChunks = core.sequences.split(core.sequences.clone(m), length)
        chunks = chunks.concat(melChunks)
      })
      const z = await vae.encode(chunks) // shape of z is [chunks, 256]

      // // 2. Use that z as input to train MidiMe.
      // // Reconstruction before training.
      // const z1 = midime.predict(z)
      // const ns1 = await vae.decode(z1)
      // z1.dispose()

      // 3. Train!
      const losses = []

      // tslint:disable-next-line:no-any
      await midime.train(z, async (epoch, logs) => {
        losses.push(logs.total)
      })

      // // 4. Check reconstruction after training.
      // const z2 = midime.predict(z)
      // const ns2 = await vae.decode(z2)
      // z2.dispose()

      this.$store.commit('setLearning', false)

      this.$store.commit('setGenerating', true)

      // 5. Sample from MidiMe
      const sample11 = await midime.sample(1)
      const sample12 = await midime.sample(1)
      const sample13 = await midime.sample(1)
      const sample14 = await midime.sample(1)
      const sample15 = await midime.sample(1)

      const ns31 = await vae.decode(sample11)
      const ns32 = await vae.decode(sample12)
      const ns33 = await vae.decode(sample13)
      const ns34 = await vae.decode(sample14)
      const ns35 = await vae.decode(sample15)

      sample11.dispose()
      sample12.dispose()
      sample13.dispose()
      sample14.dispose()
      sample15.dispose()

      // 5. Sample from MusicVAE.
      const sample2 = await vae.sample(1)

      // z.dispose()
      // vae.dispose()
      // midime.dispose()

      const result = []
      result.push(ns31[0], ns32[0], ns33[0], ns34[0], ns35[0])
      this.$store.commit('setGenerating', false)
      return result
    },

    startOver() {
      Tone.Transport.stop()
      this.samples = null
    },
  },
  watch: {
    midiInput() {
      if (this.midiInput && this.midiInput.type !== 'audio/mid') {
        this.error = 'Only MIDI files allowed.'
      } else {
        this.error = null
      }
    },
  },
}
</script>

<style>
</style>
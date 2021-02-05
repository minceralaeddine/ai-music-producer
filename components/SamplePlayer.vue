<template>
  <v-card
    :style="`min-width: 100%; min-height:100%`"
    :min-height="height"
    outlined
  >
    <v-card-title v-if="typeof this.sampleName === typeof 0">
      <v-icon color="primary">mdi-music</v-icon>

      <v-icon color="primary" class="mx-3">mdi-minus</v-icon>
      <h3 class="primary--text">Sample</h3>
      <v-icon x-large color="primary">{{ getIcon(this.sampleName) }}</v-icon>
    </v-card-title>
    <v-card-title v-else>
      <h3 class="primary--text">
        {{ this.sampleName }}
      </h3>
    </v-card-title>
    <v-card-actions>
      <v-btn
        text
        color="primary"
        @click="play(sample)"
        :disabled="globalPlaying"
      >
        <v-icon>mdi-play</v-icon>
      </v-btn>
      <v-btn text color="primary" @click="stop()" :disabled="!playing">
        <v-icon>mdi-stop</v-icon>
      </v-btn>
      <v-btn v-if="!disableDownload" text color="primary" @click="download">
        <v-icon>mdi-download</v-icon>
      </v-btn>
      <v-btn
        v-if="!disableRetrain"
        text
        color="primary"
        @click="$emit('retrain', sample)"
      >
        More of this
      </v-btn>
    </v-card-actions>
    <div id="result"></div>
  </v-card>
</template>

<script>
import * as Tone from 'tone'
import * as ToneMidi from '@tonejs/midi'
import { mapGetters } from 'vuex'

export default {
  props: {
    width: {
      default: undefined,
    },
    height: {
      default: undefined,
    },
    sample: {
      required: true,
    },
    sampleName: {
      required: true,
    },
    disableDownload: {
      type: Boolean,
      default: false,
    },
    disableRetrain: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      currentPart: undefined,
      scheduledStop: undefined,
      desiredQPM: undefined,
      playClick: null,
      playing: false,
    }
  },
  computed: {
    ...mapGetters({
      learning: 'learning',
      globalPlaying: 'playing',
      generating: 'generating',
    }),
  },
  methods: {
    getIcon(number) {
      switch (number) {
        case 0:
          return 'mdi-numeric-1'
        case 1:
          return 'mdi-numeric-2'
        case 2:
          return 'mdi-numeric-3'
        case 3:
          return 'mdi-numeric-4'
        case 4:
          return 'mdi-numeric-5'
        default:
          return number
      }
    },
    download() {
      this.$emit('download')
      // Create midi out of magenteSequence
      this.sample.notes.forEach((n) => (n.velocity = 127))
      const magentaMidi = core.sequenceProtoToMidi(this.sample)

      // Convert byte array to file
      const magentaFile = new Blob([magentaMidi], { type: 'audio/midi' })

      // Get url of the file
      const magentaURL = URL.createObjectURL(magentaFile)

      var element = document.createElement('a')
      element.setAttribute('href', magentaURL)
      element.setAttribute('download', ` Sample ${this.sampleName + 1}`)

      element.style.display = 'none'
      document.body.appendChild(element)

      element.click()

      document.body.removeChild(element)
    },
    makeClickSequence(seq) {
      function compareQuantizedNotes(a, b) {
        if (a.quantizedStartStep < b.quantizedStartStep) {
          return -1
        }
        if (a.quantizedStartStep > b.quantizedStartStep) {
          return 1
        }
        if (a.pitch < b.pitch) {
          return -1
        }
        return 1
      }
      const clickSeq = core.sequences.clone(seq)
      const sixteenthEnds = clickSeq.notes.map((n) => n.quantizedEndStep)
      const lastSixteenth = Math.max(...sixteenthEnds)
      for (let i = 0; i < lastSixteenth; i += 4) {
        const click = {
          pitch:
            i % 16 === 0
              ? core.constants.LO_CLICK_PITCH
              : core.constants.HI_CLICK_PITCH,
          quantizedStartStep: i,
          isDrum: true,
          quantizedEndStep: i + 1,
        }
        clickSeq.notes.push(click)
      }
      clickSeq.notes.sort(compareQuantizedNotes)
      return clickSeq
    },

    play(seq, qpm = null) {
      this.stop()
      this.$emit('play')
      this.$store.commit('setPlaying', true)
      this.playing = this.globalPlaying
      if (Tone.Transport.state !== 'stopped') {
        Tone.Transport.stop()
      }

      Tone.context.resume()
      const isQuantized = core.sequences.isQuantizedSequence(seq)
      if (this.playClick && isQuantized) {
        seq = this.makeClickSequence(seq)
      }
      if (qpm) {
        Tone.Transport.bpm.value = qpm
      } else if (seq.tempos && seq.tempos.length > 0 && seq.tempos[0].qpm > 0) {
        Tone.Transport.bpm.value = seq.tempos[0].qpm
      } else {
        Tone.Transport.bpm.value = core.constants.DEFAULT_QUARTERS_PER_MINUTE
      }
      if (isQuantized) {
        seq = core.sequences.unquantizeSequence(seq, qpm)
      } else if (qpm) {
        throw new Error('Cannot specify a `qpm` for a non-quantized sequence.')
      }
      const thisPart = new Tone.Part(
        (t, n) => {
          // Prevent playback after the part has been removed.
          if (this.currentPart !== thisPart) {
            return
          }

          if (
            n.pitch !== core.constants.LO_CLICK_PITCH &&
            n.pitch !== core.constants.HI_CLICK_PITCH
          ) {
            // this.playNote(t, n)
            // If there's a velocity, use it.
            const velocity = n.hasOwnProperty('velocity')
              ? n.velocity / core.constants.MAX_MIDI_VELOCITY
              : undefined
            const freq = Tone.Frequency(n.pitch, 'midi').toFrequency()
            const dur = n.endTime - n.startTime
            const synth = new Tone.Synth().toDestination()
            synth.triggerAttackRelease(freq, dur, t, velocity)
          }
          if (this.callbackObject) {
            Tone.Draw.schedule(() => {
              this.callbackObject.run(n, t)
            }, t)
          }
        },

        seq.notes.map((n) => [n.startTime, n])
      )
      this.currentPart = thisPart

      if (this.desiredQPM) {
        Tone.Transport.bpm.value = this.desiredQPM
      }
      this.currentPart.start()
      if (Tone.Transport.state !== 'started') {
        Tone.Transport.start()
      }

      return new Promise((resolve) => {
        this.scheduledStop = Tone.Transport.schedule(() => {
          this.stop()
          resolve()
          if (this.callbackObject) {
            this.callbackObject.stop()
          }
        }, `+${seq.totalTime}`)
      })
    },
    stop() {
      if (this.isPlaying()) {
        this.currentPart.stop()
        Tone.Transport.stop()
        this.currentPart = null
      }
      Tone.Transport.clear(this.scheduledStop)
      this.scheduledStop = undefined
      this.desiredQPM = undefined
      this.$store.commit('setPlaying', false)
      this.playing = false
    },
    isPlaying() {
      return !!this.currentPart
    },
  },
}
</script>

<style>
</style>
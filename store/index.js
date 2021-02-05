import Vue from 'vue'
export const state = () => ({
    playing: false,
    learning: false,
    generating: false,
})

export const mutations = {

    setPlaying(state, payload) {
        Vue.set(state, 'playing', payload)
    },
    setLearning(state, payload) {
        Vue.set(state, 'learning', payload);
    },
    setGenerating(state, payload) {
        Vue.set(state, 'generating', payload);
    },

}

export const actions = {

}

export const getters = {
    playing: (state) => state.playing,
    learning: (state) => state.learning,
    generating: (state) => state.generating,
}
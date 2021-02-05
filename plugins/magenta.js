    // const model = 'checkpoints/mel_chords' //chords 4bar model
    const model = 'checkpoints/mel_4bar_med_q2' //medium 4bar model
        // const model = 'checkpoints/mel_4bar_small_q2' //small 4bar model
        // const model = 'https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_2bar_small' //small 2bar model

    const globalAny = global;
    globalAny.performance = Date;
    globalAny.fetch = require('node-fetch');

    //Big Model
    const mvae = new music_vae.MusicVAE(model);
    const midime = new music_vae.MidiMe(model);

    // //Medium Model
    // const midime = new music_vae.MidiMe('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_med_q2');
    // const mvae = new music_vae.MusicVAE(
    //     'https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_med_q2'
    // )
    export { mvae };
    export { midime };
    // export { model };
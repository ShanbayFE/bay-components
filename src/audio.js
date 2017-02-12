const handlePlay = (audio) => () => {
    audio.play();
};

const handlePause = (audio) => () => {
    audio.pause();
};

const renderBtn = ($controls, type = 'play') => {
    if (type === 'play') {
        $controls.find('.play-btn').hide();
        $controls.find('.pause-btn').show();
    } else {
        $controls.find('.pause-btn').hide();
        $controls.find('.play-btn').show();
    }
};

const renderPlay = ($controls) => () => {
    renderBtn($controls, 'play');
};

const renderPause = ($controls) => () => {
    renderBtn($controls, 'pause');
};

const renderEnded = ($controls) => () => {
    console.log('ended');
};

const renderBar = ($controls) => () => {
    console.log('updating');
};

const bindEvents = ($audio, $controls) => {
    $controls
        .on('click', '.ib-play-circle-o', handlePlay($audio[0]))
        .on('click', '.ib-pause-circle', handlePause($audio[0]));
    $audio
        .on('timeupdate', renderBar($controls))
        .on('play', renderPlay($controls))
        .on('pause', renderPause($controls))
        .on('ended', renderEnded($controls));
};

const buildControls = () => {
    const controlsHTML = [
        '<div class="audio-controls">',
        '   <div class="audio-controls-btn">',
        '       <i class="ib ib-play-circle-o play-btn"></i>',
        '       <i class="ib ib-pause-circle pause-btn"></i>',
        '   </div>',
        '   <div class="audio-controls-bar">',
        '       <div class="current-point"></div>',
        '       <div class="current-bar"></div>',
        '   </div>',
        '   <div class="audio-controls-time"></div>',
        '</div>',
    ].join('');
    return $($.parseHTML(controlsHTML));
};

const initAudio = ($item) => {
    const $controls = buildControls();
    bindEvents($item, $controls);
    $item.after($controls);
};

export const initAudios = (audioSelector, options = {}) => {
    $(audioSelector).each((i, item) => {
        initAudio($(item));
    });
};

const resetControls = ($controls) => {
    $controls.find('.current-point').css('left', '0%');
    $controls.find('.current-bar').css('width', '0%');
    $controls.find('.audio-controls-time').html('00:00');
};

const handlePlay = (audio) => () => {
    audio.play();
};

const handlePause = (audio) => () => {
    audio.pause();
};

const renderPlayBtn = ($controls, type = 'play') => {
    if (type === 'play') {
        $controls.find('.play-btn').hide();
        $controls.find('.pause-btn').show();
    } else {
        $controls.find('.pause-btn').hide();
        $controls.find('.play-btn').show();
    }
};

const renderPlay = ($controls) => () => {
    renderPlayBtn($controls, 'play');
};

const renderPause = ($controls) => () => {
    renderPlayBtn($controls, 'pause');
};

const renderEnded = ($controls) => () => {
    resetControls($controls);
};

const formatNum = (num) => {
    const value = Math.floor(num);
    return value < 10 ? `0${value}` : value;
};

const formatSeconds = (mSec) => {
    const mins = formatNum(mSec / 60);
    const secs = formatNum(mSec % 60);
    return `${mins}:${secs}`;
};

const renderBar = ($controls) => (e) => {
    const videoEl = e.target;
    const currentTime = videoEl.currentTime;
    const duration = videoEl.duration;
    const percent = (videoEl.currentTime / duration) * 100;
    $controls.find('.current-point').css('left', `${percent}%`);
    $controls.find('.current-bar').css('width', `${percent}%`);
    $controls.find('.audio-controls-time').html(formatSeconds(currentTime));
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
        '       <i class="ib ib-pause-circle pause-btn" style="display: none;"></i>',
        '   </div>',
        '   <div class="audio-controls-bar">',
        '       <div class="current-point"></div>',
        '       <div class="current-bar"></div>',
        '   </div>',
        '   <div class="audio-controls-time">00:00</div>',
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

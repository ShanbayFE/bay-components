const formatNum = (num) => {
    const value = Math.floor(num);
    return value < 10 ? `0${value}` : value;
};

const formatSeconds = (mSec) => {
    const mins = formatNum(mSec / 60);
    const secs = formatNum(mSec % 60);
    return `${mins}:${secs}`;
};

export const isFullScreen = () =>
    !!(document.fullScreen || document.webkitIsFullScreen || document.mozFullScreen ||
            document.fullscreenElement);

export const toggleFullscreen = videoArea => () => {
    if (isFullScreen()) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
        return;
    }

    if (videoArea.requestFullscreen) {
        videoArea.requestFullscreen();
    } else if (videoArea.mozRequestFullScreen) {
        videoArea.mozRequestFullScreen();
    } else if (videoArea.webkitRequestFullScreen) {
        videoArea.webkitRequestFullScreen();
    } else if (videoArea.webkitEnterFullscreen) {
        videoArea.webkitEnterFullscreen();
    }
};

const resetControls = ($controls) => {
    $controls.find('.current-point').css('left', '0%');
    $controls.find('.current-bar').css('width', '0%');
    $controls.find('.video-controls-time').html('00:00');
};

const handlePlay = video => () => {
    video.play();
};

const handlePause = video => () => {
    video.pause();
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

const renderPlay = $controls => () => {
    renderPlayBtn($controls, 'play');
};

const renderPause = $controls => () => {
    renderPlayBtn($controls, 'pause');
};

const renderEnded = $controls => () => {
    resetControls($controls);
};

const renderBar = $controls => (e) => {
    const videoEl = e.target;
    const currentTime = videoEl.currentTime;
    const duration = videoEl.duration;
    const percent = (videoEl.currentTime / duration) * 100;
    $controls.find('.current-point').css('left', `${percent}%`);
    $controls.find('.current-bar').css('width', `${percent}%`);
    $controls.find('.video-controls-time').html(formatSeconds(currentTime));
};

const buildControls = () => {
    const controlsHTML = [
        '<div class="video-controls">',
        '   <div class="video-controls-btn">',
        '       <i class="ib ib-play-circle-o play-btn"></i>',
        '       <i class="ib ib-pause-circle pause-btn" style="display: none;"></i>',
        '   </div>',
        '   <div class="video-controls-time">00:00</div>',
        '   <div class="video-controls-bar">',
        '       <div class="current-point"></div>',
        '       <div class="current-bar"></div>',
        '   </div>',
        '   <div class="video-controls-time">00:00</div>',
        '   <div class="fullscreen"><i class="ib ib-expand"/></div>',
        '</div>',
    ].join('');
    return $($.parseHTML(controlsHTML));
};

const bindEvents = ($video, $controls) => {
    $controls
        .on('click', '.ib-play-circle-o', handlePlay($video[0]))
        .on('click', '.ib-pause-circle', handlePause($video[0]))
        .on('click', '.fullscreen', toggleFullscreen($video[0]));
    $video
        .on('timeupdate', renderBar($controls))
        .on('play', renderPlay($controls))
        .on('pause', renderPause($controls))
        .on('ended', renderEnded($controls));
};

const initVideo = ($item) => {
    const $controls = buildControls();
    bindEvents($item, $controls);

    $item.wrap("<div class='video-box'></div>");
    const root = $item.parent();
    root.append($controls);
};

const initVideos = (videoSelector, options = {}) => {
    $(videoSelector).each((i, item) => {
        initVideo($(item), options);
    });
};

export default initVideos;

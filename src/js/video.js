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
    $controls.find('.video-controls-remaintime').html('00:00');
};

const handleStart = ($controls, $cover, video) => () => {
    $cover.hide();
    $controls.show();
    video.play();
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
    $controls.find('.video-controls-remaintime').html(formatSeconds(currentTime));
    $controls.find('.video-controls-fulltime').html(formatSeconds(duration));
};

const buildControls = () => {
    const controlsHTML = [
        '<div class="video-controls" style="display: none;">',
        '   <div class="video-controls-btn">',
        '       <i class="ib ib-play play-btn"></i>',
        '       <i class="ib ib-pause pause-btn" style="display: none;"></i>',
        '   </div>',
        '   <div class="video-controls-remaintime">00:00</div>',
        '   <div class="video-controls-bar">',
        '       <div class="current-point"></div>',
        '       <div class="current-bar"></div>',
        '   </div>',
        '   <div class="video-controls-fulltime">00:00</div>',
        '   <div class="fullscreen"><i class="ib ib-expand"/></div>',
        '</div>',
    ].join('');
    return $($.parseHTML(controlsHTML));
};

const buildCover = () => {
    const coverHtml = [
        '<div class="video-cover">',
        '   <div class="start-btn"><i class="ib ib-play-circle-o"></i></div>',
        '</div>',
    ].join('');
    return $($.parseHTML(coverHtml));
};

const bindEvents = ($video, $controls, $cover) => {
    $cover && $cover
        .on('click', handleStart($controls, $cover, $video[0]));
    $controls
        .on('click', '.play-btn', handlePlay($video[0]))
        .on('click', '.pause-btn', handlePause($video[0]))
        .on('click', '.fullscreen', toggleFullscreen($video[0]));
    $video
        .on('timeupdate', renderBar($controls))
        .on('play', renderPlay($controls))
        .on('pause', renderPause($controls))
        .on('ended', renderEnded($controls));
};

const initVideo = ($item) => {
    $item.wrap("<div class='video-box'></div>");
    const root = $item.parent();

    const $controls = buildControls();
    root.append($controls);

    // iOS has a default cover
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (iOS) {
        bindEvents($item, $controls);
    } else {
        const $cover = buildCover();
        root.append($cover);
        bindEvents($item, $controls, $cover);
    }
};

const initVideos = (videoSelector, options = {}) => {
    $(videoSelector).each((i, item) => {
        initVideo($(item), options);
    });
};

export default initVideos;

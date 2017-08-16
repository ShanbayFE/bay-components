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
        $controls.hide();
        $controls.find('.play-btn').hide();
        $controls.find('.pause-btn').show();
    } else {
        $controls.show();
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

const renderBar = ($controls, currentTime, duration) => {
    const percent = (currentTime / duration) * 100;
    $controls.find('.current-point').css('left', `${percent}%`);
    $controls.find('.current-bar').css('width', `${percent}%`);
    $controls.find('.video-controls-remaintime').html(formatSeconds(currentTime));
    $controls.find('.video-controls-fulltime').html(formatSeconds(duration));
};

const buildControls = (options) => {
    const { captions = [] } = options;
    const hasCaptionBtn = captions.length;
    const captionsBtnHTML = [
        '<div class="caption-btn"><i class="ib ib-eye-o"/></div>',
    ].join('');

    const controlsHTML = [
        `<div class="video-controls ${hasCaptionBtn ? 'has-captions' : ''}" style="display: none;">`,
        '   <div class="player-btn">',
        '       <i class="ib ib-play play-btn"></i>',
        '       <i class="ib ib-pause pause-btn" style="display: none;"></i>',
        '   </div>',
        '   <div class="current-time">00:00</div>',
        '   <div class="bar">',
        '       <div class="current-point"></div>',
        '       <div class="current-bar"></div>',
        '   </div>',
        '   <div class="fulltime">00:00</div>',
        hasCaptionBtn ? captionsBtnHTML : '',
        '   <div class="fullscreen-btn"><i class="ib ib-expand"/></div>',
        '</div>',
    ].join('');
    return $($.parseHTML(controlsHTML));
};

const buildCaption = () => {
    const captionHTML = [
        '<div class="caption">',
        '</div>',
    ].join('');

    return $(captionHTML);
};

const updateCaption = ($caption, currentTime, captions) => {
    const caption = captions.find((item, i) => {
        const isLastItem = i === captions.length - 1;
        const nextItemTime = captions[i + 1] && captions[i + 1].time;
        if ((currentTime >= item.time && (isLastItem || currentTime < nextItemTime))) {
            return true;
        }
        return false;
    });

    $caption.text(caption ? caption.text : '');
};

const buildCover = () => {
    const coverHtml = [
        '<div class="video-cover">',
        '   <div class="start-btn"><i class="ib ib-play-circle-o"></i></div>',
        '</div>',
    ].join('');
    return $(coverHtml);
};

const bindEvents = ($video, $controls, $cover, $caption, options) => {
    $cover && $cover
        .on('click', handleStart($controls, $cover, $video[0]));
    $controls
        .on('click', '.play-btn', handlePlay($video[0]))
        .on('click', '.pause-btn', handlePause($video[0]))
        .on('click', '.caption-btn', () => $caption.toggle())
        .on('click', '.fullscreen-btn', toggleFullscreen($video[0]));
    $video
        .on('timeupdate', (e) => {
            const videoEl = e.target;
            const currentTime = videoEl.currentTime;
            const duration = videoEl.duration;

            renderBar($controls, currentTime, duration);
            updateCaption($caption, currentTime, options.captions);
        })
        .on('play', renderPlay($controls))
        .on('pause', renderPause($controls))
        .on('ended', renderEnded($controls))
        .on('click', () => $controls.toggle());
};

const initVideo = ($item, options) => {
    $item.wrap("<div class='bay-video-box'></div>");
    const root = $item.parent();

    const $controls = buildControls(options);
    root.append($controls);

    const $caption = buildCaption();
    root.append($caption);

    const $cover = buildCover();
    root.append($cover);
    bindEvents($item, $controls, $cover, $caption, options);
};

const initVideos = (videoSelector, options = {}) => {
    const defaultOptions = {
        hasCustomFullscreen: true,
        captions: [{
            time: 1,
            text: 'hello',
        }, {
            time: 10,
            text: 'hello hahaha',
        }],
        // fullScreenHTML: '<p>heheha</p>',
    };

    $(videoSelector).attr('webkit-playsinline', true).attr('playsinline', true).addClass('bay-video');
    $(videoSelector).each((i, item) => {
        initVideo($(item), $.extend({}, defaultOptions, options));
    });
};

export default initVideos;

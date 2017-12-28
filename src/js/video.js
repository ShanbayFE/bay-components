import { enableInlineVideo } from './iphone-inline-video';

const formatNum = num => {
    const value = Math.floor(num);
    return value < 10 ? `0${value}` : value;
};

const formatSeconds = mSec => {
    const mins = formatNum(mSec / 60);
    const secs = formatNum(mSec % 60);
    return `${mins}:${secs}`;
};

export const checkFullScreen = () =>
    !!(
        document.fullScreen ||
        document.webkitIsFullScreen ||
        document.mozFullScreen ||
        document.fullscreenElement
    );

const requestFullscreen = el => {
    if (el.requestFullscreen) {
        el.requestFullscreen();
    } else if (el.mozRequestFullScreen) {
        el.mozRequestFullScreen();
    } else if (el.webkitRequestFullScreen) {
        el.webkitRequestFullScreen();
    } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen();
    }
};

const resetControls = $controls => {
    $controls.find('.current-point').css('left', '0%');
    $controls.find('.current-bar').css('width', '0%');
    $controls.find('.video-controls-remaintime').html('00:00');
};

const handleStart = ($controls, $cover, video, options) => () => {
    $cover.hide();
    video.onerror = e => {
        alert(JSON.stringify(e));
    };
    video.play();
    options.onStartBtnClick();
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

const renderPlay = $controls => {
    renderPlayBtn($controls, 'play');
};

const renderPause = $controls => {
    renderPlayBtn($controls, 'pause');
};

const renderEnded = $controls => {
    resetControls($controls);
};

const renderBar = ($controls, currentTime, duration) => {
    const percent = currentTime / duration * 100;
    $controls.find('.current-point').css('left', `${percent}%`);
    $controls.find('.current-bar').css('width', `${percent}%`);
    $controls.find('.current-time').html(formatSeconds(currentTime));
    $controls.find('.fulltime').html(formatSeconds(duration));
};

const buildControls = options => {
    const { captions = [] } = options;
    const hasCaptionBtn = captions.length;
    const captionsBtnHTML = ['<div class="caption-btn"><i class="ib ib-eye-o"/></div>'].join('');

    const controlsHTML = [
        `<div class="video-controls ${
            hasCaptionBtn ? 'has-captions' : ''
        }" style="display: none;">`,
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
    const captionHTML = ['<div class="caption">', '</div>'].join('');

    return $(captionHTML);
};

const updateCaption = ($caption, currentTime, captions) => {
    const caption = captions.find(item => {
        if (currentTime >= item.startTime && currentTime <= item.endTime) {
            return true;
        }
        return false;
    });

    $caption.html(caption ? `<p>${caption.text}</p><p>${caption.transText}</p>` : '');
};

const buildCover = poster => {
    const coverHtml = [
        `<div class="video-cover" style="background-image: url(${poster})">`,
        '   <div class="start-btn"><i class="ib ib-play-circle-o"></i></div>',
        '</div>',
    ].join('');
    return $(coverHtml);
};

export const toggleCustomFullscreen = ($box, options) => {
    const parentClassName = 'bay-video-fullscreen-wrap';
    const video = $box.find('video')[0];
    const isVideoPaused = video.paused || video.ended;

    if ($box.parent().hasClass(parentClassName)) {
        // options.onFullscreennChange('exit', 'custom');
        $box.unwrap('');
    } else {
        // options.onFullscreennChange('enter', 'custom');
        $box.wrap(`<div class="${parentClassName}"></div>`);
    }

    // wrap or unwrap will make video pause
    if (!isVideoPaused) {
        video.play();
    }
};

export const toggleNativeFullscreen = video => {
    if (checkFullScreen()) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
        return;
    }

    if (video.requestFullscreen) {
        video.requestFullscreen();
    } else if (video.mozRequestFullScreen) {
        video.mozRequestFullScreen();
    } else if (video.webkitRequestFullScreen) {
        video.webkitRequestFullScreen();
    } else if (video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
    }
};

const bindEvents = ($video, $controls, $cover, $caption, $box, options) => {
    const video = $video[0];
    let hasPlayed = false;
    let videoHeight = video.clientHeight;

    const screenChangeHandler = () => {
        const windowHeight = window.outerHeight;
        const captionY = (windowHeight - videoHeight) / 2;
        if (checkFullScreen()) {
            $caption.addClass('fullscreen');
            $caption.css('transform', `translate(0, -${captionY}px)`);
            requestFullscreen($caption[0]);
        } else {
            $caption.css('transform', 'translate(0, 0)');
            $caption.removeClass('fullscreen');
        }
    };

    $cover && $cover.on('click', handleStart($controls, $cover, video, options));

    $controls
        .on('click', '.play-btn', handlePlay(video))
        .on('click', '.pause-btn', handlePause(video))
        .on('click', '.caption-btn', () => {
            $controls.hide();
            $caption.toggle();
        })
        .on('click', '.fullscreen-btn', () => {
            if (options.isFullscreenCustomed) {
                toggleCustomFullscreen($box, options);
            } else {
                toggleNativeFullscreen(video);
            }
        });

    $video
        .on('timeupdate', e => {
            const videoEl = e.target;
            const currentTime = videoEl.currentTime;
            const duration = videoEl.duration;

            renderBar($controls, currentTime, duration);
            updateCaption($caption, currentTime, options.captions);
            options.onTimeUpdate(currentTime, duration, videoEl);
        })
        .on('play', () => {
            if (!hasPlayed) {
                videoHeight = video.clientHeight;
                $caption.show();
                hasPlayed = true;
            }
            renderPlay($controls);
            options.onPlay();
        })
        .on('pause', () => {
            renderPause($controls);
            options.onPause();
        })
        .on('ended', () => {
            renderEnded($controls);
            options.onEnd();
        })
        .on('click', () => $controls.toggle())
        .on('x5videoenterfullscreen', () => {
            options.onFullscreennChange('enter', 'native');
        })
        .on('x5videoexitfullscreen', () => {
            options.onFullscreennChange('exit', 'native');
        })
        .on('webkitfullscreenchange', () => {
            options.onFullscreennChange(checkFullScreen() ? 'enter' : 'exit', 'native');
            screenChangeHandler();
        })
        .on('mozfullscreenchange', () => {
            options.onFullscreennChange(checkFullScreen() ? 'enter' : 'exit', 'native');
            screenChangeHandler();
        })
        .on('MSFullscreenChange', () => {
            options.onFullscreennChange(checkFullScreen() ? 'enter' : 'exit', 'native');
            screenChangeHandler();
        })
        .on('fullscreenchange', () => {
            options.onFullscreennChange(checkFullScreen() ? 'enter' : 'exit', 'native');
            screenChangeHandler();
        });
};

const initVideo = ($item, options) => {
    enableInlineVideo($item[0]);

    $item.wrap("<div class='bay-video-box'></div>");

    const root = $item.parent();

    const $controls = buildControls(options);
    root.append($controls);

    const $caption = buildCaption();
    $caption.hide();
    root.append($caption);

    const poster = $item.data('poster');
    const $cover = buildCover(poster);
    root.append($cover);
    bindEvents($item, $controls, $cover, $caption, root, options);
};

const initVideos = (videoSelector, options = {}) => {
    const defaultOptions = {
        isFullscreenCustomed: false,
        onFullscreennChange: () => {},
        onTimeUpdate: () => {},
        onStartBtnClick: () => {},
        onPlay: () => {},
        onPause: () => {},
        onEnd: () => {},
        captions: [],
    };

    $(videoSelector)
        .addClass('bay-video')
        .attr('webkit-playsinline', true)
        .attr('playsinline', true)
        .attr('x5-video-orientation', 'portrait')
        .attr('x5-video-player-type', 'h5');

    $(videoSelector).each((i, item) => {
        initVideo($(item), $.extend(defaultOptions, options));
    });
};

export default initVideos;

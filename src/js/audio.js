const formatNum = (num) => {
    const value = Math.floor(num);
    return value < 10 ? `0${value}` : value;
};

const formatSeconds = (mSec) => {
    const mins = formatNum(mSec / 60);
    const secs = formatNum(mSec % 60);
    return `${mins}:${secs}`;
};

const resetControls = ($controls) => {
    $controls.find('.current-point').css('left', '0%');
    $controls.find('.current-bar').css('width', '0%');
    $controls.find('.audio-controls-time').html('00:00');
};

const handlePlay = (audio, $audios) => () => {
    $audios.each((i, item) => item.pause());
    audio.play();
};

const handlePause = audio => () => {
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
    const audioEl = e.target;
    const currentTime = audioEl.currentTime;
    const duration = audioEl.duration;
    const percent = (audioEl.currentTime / duration) * 100;
    $controls.find('.current-point').css('left', `${percent}%`);
    $controls.find('.current-bar').css('width', `${percent}%`);
    $controls.find('.audio-controls-time').html(formatSeconds(currentTime));
};

const buildControls = () => {
    const controlsHTML = [
        '<div class="audio-controls">',
        '   <div class="audio-controls-content">',
        '      <div class="audio-controls-btn">',
        '          <i class="ib ib-play-circle-o play-btn"></i>',
        '          <i class="ib ib-pause-circle pause-btn" style="display: none;"></i>',
        '      </div>',
        '      <div class="audio-controls-bar">',
        '          <div class="current-point"></div>',
        '          <div class="current-bar"></div>',
        '      </div>',
        '      <div class="audio-controls-time">00:00</div>',
        '   </div>',
        '</div>',
    ].join('');
    return $($.parseHTML(controlsHTML));
};

const bindEvents = ($audio, $controls, $audios) => {
    const currentPoint = $controls.find('.current-point');
    const currentBar = $controls.find('.current-bar');
    const audio = $audio[0];
    let percent = 0;

    currentPoint.on('mousedown touchstart', function startEvent(event) {
        const offsetX = $(this)[0].offsetLeft;
        const mouseX = event.pageX || event.originalEvent.targetTouches[0].pageX;
        const controlWidth = $(this).parent().width();

        $(document).on('mousemove touchmove', (ev) => {
            const x = (ev.pageX || ev.originalEvent.targetTouches[0].pageX) - mouseX;
            const nowX = offsetX + x;
            percent = (nowX / controlWidth) * 100;

            audio.pause();

            if (nowX >= 0 && nowX <= controlWidth - 4) {
                currentPoint.css({
                    left: `${percent}%`,
                });
                currentBar.css({
                    width: `${percent}%`,
                });
            }
        });
    });

    currentPoint.on('mouseup touchend', () => {
        audio.currentTime = (audio.duration * percent) / 100;
        audio.play();
        $(document).off('mousemove touchmove');
    });

    $controls
        .on('click', '.play-btn', handlePlay($audio[0], $audios))
        .on('click', '.pause-btn', handlePause($audio[0]));
    $audio
        .on('timeupdate', renderBar($controls))
        .on('play', renderPlay($controls, $audios))
        .on('pause', renderPause($controls))
        .on('ended', renderEnded($controls));
};

const initAudio = ($item, options, $audios) => {
    const $controls = buildControls();
    bindEvents($item, $controls, $audios);
    $item.after($controls);
};

const initAudios = (audioSelector, options = {}) => {
    $(audioSelector).each((i, item) => {
        initAudio($(item), options, $(audioSelector));
    });
};

export default initAudios;

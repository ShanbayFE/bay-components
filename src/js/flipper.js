const $window = $(window);
const windowHeight = $window.height();

const BOUNDARY_BUFFER = 0;
const TIME_BUFFER = 600;
let pageNum = 1;

const bindEvents = ($container, $pages, $nextBtn, onChangePage) => {
    let touchClientY;
    let isTop = false;
    let isBottom = false;
    let prevTime = new Date().getTime();
    let prevClickTime = new Date().getTime();

    const pageLength = $pages.length;

    const navToPage = (direction) => {
        const top = parseInt($container.css('transform').split(',')[5], 10);
        const offset = direction < 0 ? top + windowHeight : top - windowHeight;
        const sumHeight = pageLength * windowHeight;

        if (Math.abs(offset) < sumHeight - windowHeight) {
            $nextBtn.show();
        } else {
            $nextBtn.hide();
        }
        $container.css('transform', `translate3d(0, ${offset}px, 0)`);
        document.body.scrollTop = 0;
        onChangePage(pageNum);
    };

    const navToNextPage = () => {
        pageNum += 1;
        navToPage(1);
    };

    const navToPrevPage = () => {
        pageNum -= 1;
        navToPage(-1);
    };

    $pages.on('touchstart', (e) => {
        // 记录 touchstart 时的 Y 位置
        touchClientY = e.originalEvent.touches[0].clientY;
    });

    $pages.on('touchmove', (e) => {
        const $el = $(e.currentTarget);

        const touchCurrentClientY = e.originalEvent.touches[0].clientY;
        // 到达页面顶部: 向上滑动的距离很小
        isTop = $el.scrollTop() === BOUNDARY_BUFFER;

        // 到达页面底部: 向上滑动的距离 + 屏幕高度 >= 该页页面高度
        isBottom = $el.scrollTop() + $el.outerHeight() + 1 >= $el[0].scrollHeight;

        if (touchCurrentClientY >= touchClientY) {
            // 向上滑动

            isBottom = false;

            // 到达页面顶部
            if (isTop) {
                // 阻止浏览器滚动
                e.preventDefault();
            }
        } else {
            // 向下滑动
            isTop = false;

            // 到达页面底部
            if (isBottom) {
                // 阻止浏览器滚动
                e.preventDefault();
            }
        }
    });

    $pages.on('touchend', (e) => {
        const $el = $(e.currentTarget);
        const touchCurrentClientY = e.originalEvent.changedTouches[0].clientY;

        const curTime = new Date().getTime();
        const timeDiff = curTime - prevTime;

        if (timeDiff < TIME_BUFFER) {
            return;
        }

        if (
            touchCurrentClientY > touchClientY // 向上滑动
            && isTop // 到达页面顶部
            && $el.index() > 0 // 不是第一页
        ) {
            // 滑动到上一页
            prevTime = curTime;
            isTop = false;
            navToPrevPage();
        } else if (
            touchCurrentClientY < touchClientY // 向下滑动
            && isBottom // 到达页面底部
            && $el.index() + 1 < pageLength // 不是最后一页
        ) {
            // 滑动到下一页
            prevTime = curTime;
            isBottom = false;
            navToNextPage();
        }
    });

    $nextBtn.on('click', () => {
        const curTime = new Date().getTime();
        const timeDiff = curTime - prevClickTime;
        prevClickTime = curTime;

        if (timeDiff < TIME_BUFFER) {
            return;
        }

        navToNextPage();
    });
};

const initFlipper = (options) => {
    const { $container, $nextBtn, onChangePage = () => {} } = options;
    const $pages = $container.children();

    $('html').css('height', '100%');
    $('body').css('height', '100%');

    bindEvents($container, $pages, $nextBtn, onChangePage);
};

export default initFlipper;

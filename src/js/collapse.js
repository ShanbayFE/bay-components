const trimText = ($text, height) => {
    const reg = /\s(\S+)$/;
    const regCn = new RegExp('[\\u4E00-\\u9FFF]+');
    let text = $text.html();

    while ($text.height() > height) {
        const result = reg.exec(text);
        let length = 2;

        if (result) {
            const isCn = regCn.test(result[0]);
            if (!isCn) length = result[0].length;
        }

        text = `${$text.html().slice(0, -length)}&hellip;`;
        $text.html(text);
    }

    return $text.html();
};

const initCollapse = () => {
    const $els = $('[bay-length-limited]');

    // 不要改为箭头函数，因为函数里使用了 this
    $els.each(function () {
        const $el = $(this);

        const text = $el.html();
        const maxLine = $el.attr('max-line');

        const $wrapper = $(`<div class="wrapper bay-collapse"><p>${text}</p></div>`);
        const $text = $wrapper.find('p');
        const $toggleFoldBtn = $('<a class="toggle-fold-btn">展开</a>');

        let isFolding = true;

        $(this).html($wrapper);

        // 没有 maxLine
        if (!maxLine) {
            return;
        }

        const lineHeight = $text.css('lineHeight');
        const height = parseInt(lineHeight, 10) * maxLine;

        // 字数没有超过限制
        if ($text.height() <= height) {
            return;
        }

        // 处理元素
        $wrapper.append($toggleFoldBtn);

        // 截取文字
        const trimmedText = trimText($text, height);

        // 绑定事件
        const bindEvents = () => {
            $toggleFoldBtn.on('click', () => {
                isFolding = !isFolding;
                if (!isFolding) {
                    $text.html(text);
                    $toggleFoldBtn.html('收起');
                } else {
                    $text.html(trimmedText);
                    $toggleFoldBtn.html('展开');
                }
            });
        };

        bindEvents();
    });
};

export default initCollapse;

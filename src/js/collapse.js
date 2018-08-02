const initCollapse = () => {
    const $els = $('[bay-length-limited]');

    $els.each((idx, el) => {
        const $el = $(el);

        const text = $el.html();
        const maxLine = $el.attr('max-line');

        const $wrapper = $(`<div class="wrapper bay-collapse"><p>${text}</p></div>`);
        const $text = $wrapper.find('p');
        const $toggleFoldBtn = $('<a class="toggle-fold-btn">展开</a>');

        let isFolding = true;

        $(el).html($wrapper);

        if (!maxLine) {
            return;
        }

        const lineHeight = $text.css('lineHeight');
        const height = parseInt(lineHeight, 10) * maxLine;

        if ($text.height() <= height) {
            return;
        }

        $text.css({ '-webkit-line-clamp': maxLine });
        $wrapper.append($toggleFoldBtn);

        $toggleFoldBtn.on('click', () => {
            isFolding = !isFolding;
            if (!isFolding) {
                $text.css({ '-webkit-line-clamp': '' });
                $toggleFoldBtn.html('收起');
            } else {
                $text.css({ '-webkit-line-clamp': maxLine });
                $toggleFoldBtn.html('展开');
            }
        });
    });
};

export default initCollapse;

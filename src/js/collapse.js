const initCollapse = () => {
    const $els = $('[bay-length-limited]');

    // need this
    $els.each(function () {
        const $el = $(this);
        const text = $el.html();
        const maxLine = $el.attr('max-line');
        // const maxLength = $el.attr('max-length');
        const $wrapper = $(`<div class="wrapper bay-collapse"><p>${text}</p></div>`);

        $(this).html($wrapper);

        const $text = $wrapper.find('p');
        const lineHeight = $text.css('lineHeight');
        const height = parseInt(lineHeight, 10) * maxLine;
        $wrapper.height(height);

        while ($text.height() > height) {
            $text.text((index, str) => str.slice(0, -1));
        }

        // TODO: 截取一个单词
        $text.text((index, str) => str.slice(0, -3).concat('...'));
    });
};

export default initCollapse;

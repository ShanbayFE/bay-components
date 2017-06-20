class RenderEditor {
    constructor(config) {
        this.$el = null;
        this.config = $.extend({}, RenderEditor.defaultOptions, config);
        this.value = this.config.defaultValue;

        if (!this.$el) {
            this.render();
        }

        this.$textarea = this.$el.find('textarea');
        this.$options = this.$el.find('.option-check');

        this.bindEvents();

        return this;
    }

    bindEvents() {
        this.$el
            .on('click', '[data-action=send]', (e) => {
                e.stopPropagation();
                this.submitHandler();
            })
            .on('change', 'textarea', (e) => {
                e.stopPropagation();
                $.proxy(this.config.change, this, e.currentTarget.value);
            })
            .on('click', '[data-action=close]', (e) => {
                e.stopPropagation();
                this.closeHandler();
            });
    }

    show() {
        this.$el.animate({
            bottom: 0,
        }, 300, 'linear');
    }

    close() {
        this.$el.animate({
            bottom: '-100%',
        }, 300, 'linear', () => {
            this.destory();
        });
    }

    destory() {
        this.$el.remove();
    }

    closeHandler() {
        const { onClose } = this.config;
        const { txt, checkedVals } = this.getValue();
        const willClose = $.proxy(onClose, this)(txt, { checkedVals });

        if (willClose) {
            this.close();
        }
    }

    getValue() {
        const txt = this.$textarea.val();
        const checkedVals = [];

        this.$options
            .filter(':checked')
            .each((index, elem) => checkedVals.push(elem.value));

        return {
            txt,
            checkedVals,
        };
    }

    submitHandler() {
        const { onSubmit } = this.config;
        const {txt, checkedVals } = this.getValue();

        $.proxy(onSubmit, this)(
            txt,
            {
                checkedVals,
            },
        );
    }

    render() {
        const config = this.config;
        const template = `
            <div class="bay-render-editor">
                <header>
                    <a class="close-btn" data-action="close">
                        <i class="ib ib-times"></i>
                    </a>
                    <a class="send-btn" data-action="send">发送</a>
                </header>
                <textarea placeholder="${config.placeholder}">${this.value}</textarea>
                <div class="select-options">
                    ${config.checkboxData.items.map(item =>
                            `<div class="option">
                                <label><input class="option-check" type="checkbox" ${item.checked ? 'checked' : ''} value="${item.value}"/>${item.title}</label>
                            </div>`,
                        ).join('')
                    }
                </div>
            </div>`;

        $(template).appendTo('body');
        this.$el = $('.bay-render-editor');
    }
}

RenderEditor.defaultOptions = {
    defaultValue: '',
    placeholder: '写点什么....',
    onClose: () => true,
    onSubmit: $.noop,
    onChange: $.noop,
    checkboxData: {
        items: [
            // { title: '', checked: '', value: ''}
        ],
    },

    submitText: '发送',
};

let instance;
const renderEditor = (config) => {
    if (instance) {
        instance.destory();
    }

    instance = new RenderEditor(config);
    instance.show();

    return instance;
};

export default renderEditor;

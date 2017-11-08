const { merge } = bayUtils;

/*
    tabs 的 html 结构如下：
    .tabs
        .tabs-header
            .tab-title
            .tab-title
            .tab-title
        .tabs-body
            .tabs-panel
            .tabs-panel
            .tabs-panel
*/
class Tabs {
    constructor(options) {
        this.options = merge(options, {
            $el: $('.tabs'),
            defaultIndex: 0,
            onChangeTab: () => {},
        });

        this.render = this.render.bind(this);
        this.bindEvents = this.bindEvents.bind(this);
        this.changeTab = this.changeTab.bind(this);
        this.showTab = this.showTab.bind(this);

        this.render();
        this.bindEvents();
    }

    bindEvents() {
        const { $el } = this.options;

        const $tabTitle = $el.find('.tab-title');
        $tabTitle.on('touchstart', this.changeTab);
    }

    changeTab(e) {
        const { $el } = this.options;
        const $tabTitle = $(e.currentTarget);
        const index = $el.find('.tab-title').index($tabTitle);

        this.showTab(index);
    }

    showTab(index) {
        const { $el, onChangeTab } = this.options;

        $el.find('.tab-panel').hide();
        $el.find('.tab-title').removeClass('active');
        $el.find(`.tab-title:nth-child(${index + 1})`).addClass('active');
        $el.find(`.tab-panel:nth-child(${index + 1})`).show();
        onChangeTab(index);
    }

    render() {
        this.options.$el.addClass('bay-tabs');
        this.showTab(this.options.defaultIndex);
    }
}

const tabs = options => new Tabs(options);

export default tabs;

/* global bayUtils */
const { ajax } = bayUtils;

export class PullToLoadList {
    constructor(options = {}) {
        const defaultOptions = {
            container: window,
            ipp: 10,
            pageNum: 0,
            total: 0,
            apiUrl: '',
            threshold: 10,
            renderItem: () => {},
            onLoadedFirstPage: () => {},
            onLoadedError: () => {},
            parseData: data => ({
                items: data.objects,
                total: data.total,
            }),
        };
        this.options = $.extend({}, defaultOptions, options);

        this.apiUrl = this.options.apiUrl;
        this.ipp = this.options.ipp;
        this.pageNum = this.options.pageNum;
        this.total = this.options.total;
        this.renderItem = this.options.renderItem;
        this.parseData = this.options.parseData;
        this.onLoadedFirstPage = this.options.onLoadedFirstPage;
        this.onLoadedError = this.options.onLoadedError;
        this.threshold = this.options.threshold;
        this.container = this.options.container;

        this.items = [];
        this.isLoading = false;
        this.$loadHint = $('#load-hint');
        this.$loadMoreHint = $('#load-more-hint');

        this.init();
    }

    init() {
        if (this.pageNum > 0) {
            this.onLoadedFirstPage({});
        } else {
            this.pageNum += 1;
            this.loadItems(this.onLoadedFirstPage, this.onLoadedError);
        }
        this.bindEvents();
    }

    bindEvents() {
        const $window = $(window);
        const container = $(this.container)[0];
        const $body = $('body');

        $window.on('touchmove mousewheel', () => {
            if (this.isLoading) return;

            if (container === window) {
                const docRoot = document.documentElement;

                if (
                    docRoot.scrollHeight -
                        Math.ceil(window.scrollY || window.pageYOffset) -
                        this.threshold <=
                    docRoot.clientHeight
                ) {
                    this.loadMoreData();
                }
            } else {
                // reference: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight
                // Note: container 固定高 且 scroll
                if (
                    container.scrollHeight - Math.ceil(container.scrollTop) - this.threshold <=
                    container.clientHeight
                ) {
                    this.loadMoreData();
                }
            }
        });
        $body.on('click', '#load-more-hint', () => {
            this.loadMoreData();
        });
    }

    loadMoreData() {
        if (this.checkIsLastPage()) {
            return;
        }

        this.pageNum += 1;
        this.renderLoading();
        this.loadItems();
    }

    checkIsLastPage() {
        return this.pageNum * this.ipp >= this.total;
    }

    renderMoreHint() {
        if (!this.checkIsLastPage()) {
            this.$loadMoreHint.show();
        } else {
            this.$loadMoreHint.hide();
        }
    }

    renderLoading() {
        this.$loadMoreHint.hide();
        this.$loadHint.show();
    }

    renderItems() {
        this.items.forEach(item => this.renderItem(item));
        this.renderMoreHint();
    }

    loadItems(onSuccess = () => {}, onError = () => {}) {
        this.isLoading = true;
        let url;
        if (this.apiUrl.split('?').length > 1) {
            url = `${this.apiUrl}&page=${this.pageNum}&ipp=${this.ipp}`;
        } else {
            url = `${this.apiUrl}?page=${this.pageNum}&ipp=${this.ipp}`;
        }
        ajax({
            url,
            type: 'GET',
            success: data => {
                const parsedData = this.parseData(data);
                this.$loadHint.hide();
                this.items = parsedData.items;
                this.total = parsedData.total;
                this.isLoading = false;
                this.renderItems();
                onSuccess(data);
            },
            error: (status, msg) => {
                this.$loadHint.hide();
                onError(status, msg);
            },
        });
    }
}

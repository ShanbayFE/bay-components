import { ajax } from 'bay-utils';

export default class PullToLoadList {
    constructor(options = {}) {
        const defaultOptions = {
            ipp: 10,
            apiUrl: '',
            renderItem: () => {},
            onLoadedFirstPage: () => {},
            parseData: data => ({
                items: data.objects,
                total: data.total,
            }),
        };
        this.options = Object.assign({}, defaultOptions, options);

        this.apiUrl = this.options.apiUrl;
        this.ipp = this.options.ipp;
        this.renderItem = this.options.renderItem;
        this.parseData = this.options.parseData;
        this.onLoadedFirstPage = this.options.onLoadedFirstPage;

        this.items = [];
        this.pageNum = 1;
        this.total = 0;
        this.isLoading = false;
        this.$loadHint = $('#load-hint');
        this.$loadMoreHint = $('#load-more-hint');

        this.init();
    }

    init() {
        this.loadItems(this.onLoadedFirstPage);
        this.bindEvents();
    }

    bindEvents() {
        const $window = $(window);
        const $document = $(document);
        const $body = $('body');

        $window.on('touchmove mousewheel', () => {
            if (this.isLoading) return;
            if (($window.scrollTop() + $window.height()) - $document.height() >= 0) {
                this.loadMoreData();
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

    loadItems(callback = () => {}) {
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
            success: (data) => {
                const parsedData = this.parseData(data);
                this.$loadHint.hide();
                this.items = parsedData.items;
                this.total = parsedData.total;
                this.isLoading = false;
                this.renderItems();
                callback && callback(data);
            },
            error: () => {
                this.$loadHint.hide();
                callback && callback();
            },
        });
    }
}

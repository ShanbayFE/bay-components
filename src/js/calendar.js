import { merge, formatDate } from 'bay-utils';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const node = (tag, children, options = {}) =>
    `<${tag} ${Object.keys(options).map(key => `${key}="${options[key]}"`).join(' ')}>
        ${children}
    </${tag}>`;

const group = (data) => {
    const arr = [];

    for (let i = data.min; i <= data.max; i += 1) {
        arr.push(node(data.node, data.item(i)));
    }

    return arr.join('');
};

// 根据开始和结束日期获取一个日期列表
const getDates = (startDate, stopDate) => {
    const dateArray = [];
    const currentDate = new Date(startDate);

    while (currentDate <= stopDate) {
        const arr = formatDate(currentDate, 'YYYY-MM-D').split('-');
        dateArray.push({
            year: arr[0],
            month: arr[1],
            day: arr[2],
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateArray;
};

// 获取当前显示的日期
const getActiveDates = (activeDate) => {
    const firstDate = new Date(activeDate.replace('.', '-'));
    const firstDay = firstDate.getDay();
    firstDate.setDate(firstDate.getDate() - firstDay);
    const lastDate = new Date(firstDate);
    // 显示的日期共有 6 * 7 个，所以最后一个日期为 firstDate + 41
    lastDate.setDate(firstDate.getDate() + 41);

    return getDates(firstDate, lastDate);
};

class Calendar {
    constructor(options) {
        this.options = merge(options, {
            $el: $('#calendar'),
            activeDate: new Date(),
            min: new Date(),
            max: new Date(),
            dates: {
                primary: [],
                secondary: [],
            },
            onClickDate: () => {},
        });

        Object.keys(this.options).forEach((key) => {
            this[key] = this.options[key];
        });

        this.handleClickDate = this.handleClickDate.bind(this);
        this.tableHead = this.tableHead.bind(this);
        this.tableRow = this.tableRow.bind(this);
        this.tableBody = this.tableBody.bind(this);
        this.table = this.table.bind(this);

        this.init();
    }

    init() {
        this.$el.addClass('bay-calendar');

        this.activeDate = formatDate(this.activeDate, 'YYYY.MM');
        this.min = formatDate(this.min, 'YYYY.MM');
        this.max = formatDate(this.max, 'YYYY.MM');
        this.dates.primary =
            this.dates.primary ?
            this.dates.primary.map(item => formatDate(item, 'YYYY-MM-D')) :
            [];
        this.dates.secondary =
            this.dates.secondary ?
            this.dates.secondary.map(item => formatDate(item, 'YYYY-MM-D')) :
            [];

        this.render();
        this.bindEvents();
    }

    render() {
        this.$el.html('');
        this.$el.html(this.monthNav() + this.table());
    }

    bindEvents() {
        this.$el.on('click', '.prev-month-btn', (e) => {
            if ($(e.currentTarget).hasClass('disabled')) return;
            this.updateMonth(-1);
        });
        this.$el.on('click', '.next-month-btn', (e) => {
            if ($(e.currentTarget).hasClass('disabled')) return;
            this.updateMonth(1);
        });
        this.$el.on('click', '.date-btn', this.handleClickDate);
    }

    updateMonth(num) {
        this.activeDate = new Date(this.activeDate.replace('.', '-'));
        // update activeDate
        this.activeDate.setMonth(this.activeDate.getMonth() + num);
        this.activeDate = formatDate(this.activeDate, 'YYYY.MM');
        this.render();
    }

    handleClickDate(e) {
        const $el = $(e.currentTarget);
        const date = $el.data('date');

        this.onClickDate(date);
    }

    // Create the nav for next/prev month.
    monthNav() {
        if (this.activeDate < this.min || this.activeDate > this.max) {
            throw Error('请检查一下参数，activeDate 不在范围内');
        }

        return node(
            'div',
            node('i', '', {
                class: `
                    ib ib-chevron-left prev-month-btn
                    ${this.activeDate === this.min ? 'disabled' : ''}
                `,
            })
            + node('span', this.activeDate)
            + node('i', '', {
                class: `
                    ib ib-chevron-right next-month-btn
                    ${this.activeDate === this.max ? 'disabled' : ''}
                `,
            }),
            { class: 'header-nav' },
        );
    }

    // Create and return the table head group.
    tableHead() {
        return node(
            'thead',
            node(
                'tr',
                group({
                    node: 'th',
                    min: 0,
                    max: 6,
                    item: counter => weekdays[counter],
                }),
            ),
        );
    }

    tableRow(row) {
        const activeDates = getActiveDates(this.activeDate);
        const activeMonth = this.activeDate.split('.')[1];

        return group({
            node: 'td',
            min: 0,
            max: 6,
            item: (counter) => {
                const index = (row * 7) + counter;
                const date = activeDates[index];
                const dateStr = `${date.year}-${date.month}-${date.day}`;

                return node(
                    'div',
                    date.day,
                    {
                        class: `
                            ${activeMonth !== date.month ? 'disabled' : ''}
                            ${this.dates.primary.indexOf(dateStr) !== -1 ? 'primary' : ''}
                            ${this.dates.secondary.indexOf(dateStr) !== -1 ? 'secondary' : ''}
                            date-btn
                        `,
                        'data-date': dateStr,
                    },
                );
            },
        });
    }

    tableBody() {
        return node(
            'tbody',
            group({
                node: 'tr',
                min: 0,
                max: 5,
                item: this.tableRow,
            }),
        );
    }

    table() {
        return node(
            'table',
            this.tableHead() + this.tableBody(),
        );
    }
}

const calendar = options => new Calendar(options);

export default calendar;

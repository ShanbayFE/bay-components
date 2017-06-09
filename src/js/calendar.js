import { formatDate } from 'bay-utils';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const node = (tag, children) => `<${tag}>${children}</${tag}>`;

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
        dateArray.push(formatDate(currentDate, 'D'));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateArray;
};

// 获取当前显示的日期
const getActiveDates = (activeDate) => {
    const firstDate = new Date(formatDate(activeDate, 'YYYY-MM'));
    const firstDay = firstDate.getDay();
    firstDate.setDate(firstDate.getDate() - firstDay);
    const lastDate = new Date(firstDate);
    lastDate.setDate(firstDate.getDate() + 41);

    return getDates(firstDate, lastDate);
};

class Calendar {
    constructor(options) {
        this.options = Object.assign({
            $el: $('#calendar'),
            min: '',
            max: new Date(),
        }, options);

        this.activeDate = '2017-06';

        this.tableHead = this.tableHead.bind(this);
        this.tableRow = this.tableRow.bind(this);
        this.tableBody = this.tableBody.bind(this);
        this.table = this.table.bind(this);

        this.render();
    }

    render() {
        this.dates = getActiveDates(this.activeDate);
        this.options.$el.html(this.table());
    }

    // Create the nav for next/prev month.
    monthNav(date) {
        return node(
            'div',
            date,
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

    tableRow(index) {
        return node(
            'tr',
            group({
                node: 'td',
                min: 0,
                max: 6,
                item: counter =>
                    node(
                        'div',
                        this.dates[(index * 7) + counter],
                    ),
            }),
        );
    }

    tableBody() {
        return node(
            'tbody',
            group({
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

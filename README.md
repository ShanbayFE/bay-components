# bay-components


## Audio

只要页面有 audio 标签，调用下面的函数就会渲染出 audio 的控制条等内容

```
> initAudios('audio')
```

## Video

只要页面有 video 标签，调用下面的函数就会渲染出 video 的控制条等内容

```
> initVideos('audio', {
    isFullscreenCustomed: true,
    onFullscreennChange: (type, style) => console.log(type, style),
    onTimeUpdate: (currentTime, duration, video) => console.log(currentTime, duration, video),
    captions: [{
        startTime: 1,
        endTime: 6,
        text: 'hello',
        transText: '你好',
    }, {
        startTime: 10,
        endTime: 16,
        text: 'hello hahaha',
        transText: '你好啦啦啦',
    }],
});
```

## PullToLoadList

下拉自动请求，加载更多列表。

```
> var list = new PullToLoadList({
    ipp: 10,
    pageNum: 0,
    total: 0,
    apiUrl: '',
    threshold: 10,
    renderItem: (item) => item,
    onLoadedFirstPage: () => {},
    onLoadedError: (status, msg) => {},
    parseData: data => ({
        items: data.objects,
        total: data.total,
    }),
});
```

其中 threshold 是下拉到底部的范围，默认下拉到距页面底部 10px 的范围内会继续请求下一页的数据。renderItem 是每条数据的渲染函数。parseData 是对请求返回的数据进行的处理函数。onLoadedFirstPage 是在请求完第一页数据后触发的函数。

## Comments

移动端加载评论的组件

```
> comments({
    $el: $('.comments'),
    apiUrl: '',
    ipp: 10,
    pageNum: 0,
    total: 0,
    threshold: 10,

    currentUser: {},
    // 是否禁止交互，默认为 false。如果为 true 的话，点赞回复等操作都无法进行
    isInteractiveDisabled: false,
    // 是否有点赞按钮
    hasLikeBtn: false,
    // 是否有不喜欢按钮
    hasDislikeBtn: false,
    // 是否有举报按钮
    hasReportBtn: true,
    // 是否有回复他人评论按钮
    hasNestReplyBtn: false,

    // 同下拉组件
    parseData: data => ({
        items: data.objects,
        total: data.total,
    }),
    /*
    单条评论的 data
    返回的 data 如下：
    {
        user: {
            id,
            avatar,
            nickname,
        },
        content,
        created_at,
        report_url,
        is_voted_up,
        is_voted_down,
    }
    */
    parseItemData: data => data,
    /*
        评论请求所需的数据。包含新建、编辑、回复评论
        传入的 data 如下：
        {
            commentId, // 只有编辑的时候有
            to_user_id, // 只有回复的时候有
            content,
        }
        返回的 data 如下：
        {
            url,
            type,
            data,
            ...
        }
    */
    buildCommentApiData: data => ({ data }),
    /*
        点赞评论请求所需的数据。包含点赞(up)、取消点赞(delete)、不喜欢(down)
        传入的 data 如下：
        {
            commentId,
            vote, // 有三个值：up、down、delete
        }
        返回的 data 如下：
        {
            url,
            type,
            data,
            ...
        }
    */
    buildLikeApiData: data => ({ data }),
});
```

## Tabs

移动端 tabs 组件

```
>
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
new tabs({
    $el: $('.tabs'),
    // 初始状态的 tab 的 index，默认为 0
    defaultIndex: 0,
    // 切换 tab 时的回调，传递一个参数 index
    onChangeTab: () => {},
});
```

## Collapse

限制文字行数，可以展开收起文字

```
> initCollapse()

调用方法后，作用于所有属性里有 bay-length-limited 的元素，最大行数取决于元素里的 max-line 属性。

比如：
<div bay-length-limited max-line=2>这里有一堆文字</div>
```


## Calendar

日历组件

```
> initCalendar({
    $el: $('#calendar'),
    // 当前显示的日期，格式不限，默认为 new Date()。比如：'2017-05'。
    // 注意：如果不在 min, max 范围内，会 throw Error。
    // 同 min、max 一样，计算时只考虑了年份和月份
    activeDate: new Date(),
    // 最小的日期，格式不限，默认为 new Date()。
    min: new Date(),
    // 最大的日期，格式不限，默认为 new Date()。
    max: new Date(),
    // 一些特殊的日期，格式不限
    dates: {
        primary: [],
        secondary: [],
    },
    // 点击日期的回调，传入日期
    onClickDate: () => {},
});
```

## renderEditor

输入框

```js
    a = bayComponents.renderEditor({
        defaultValue: '',
        placeholder: '写点什么....',
        onClose: () => true, // 返回 true关闭，返回false 无动作
        onSubmit: $.noop, // this 指向 renderEditor 实例
        onChange: $.noop, // this 指向 renderEditor 实例
        checkboxData: {
            items: [
                // { title: '', checked: '', value: ''}
            ],
        },

        submitText: '发送',
    })
```

## initFlipper

```js
    bayComponents.initFlipper({
        $container: $('.flipper-pages'),
        $nextBtn: $('.flipper-next-btn'),
        onChangePage: (pageNum) => console.log(pageNum);
    });
```

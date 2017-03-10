# bay-components


## Audio

只要页面有 audio 标签，调用下面的函数就会渲染出 audio 的控制条等内容

```
> initAudios('audio')
```

## Video

只要页面有 video 标签，调用下面的函数就会渲染出 video 的控制条等内容

```
> initVideos('audio')
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

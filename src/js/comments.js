/* global bayUtils bayComponents */
import comment from './comment';

const { merge, ajax } = bayUtils;

class Comments {
    constructor(options) {
        this.options = merge(options, {
            $el: $('.comments'),
            apiUrl: '',
            ipp: 10,
            pageNum: 0,
            total: 0,
            threshold: 10,

            currentUser: {},
            isInteractiveDisabled: false,
            hasLikeBtn: false,
            hasDislikeBtn: false,
            hasReportBtn: true,
            hasNestReplyBtn: false,

            parseData: data => ({
                items: data.objects,
                total: data.total,
            }),
            /* 返回的 data 格式如下：
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
                包含新建、编辑、回复评论
                传入的 data：{
                    commentId, // 只有编辑的时候有
                    to_user_id, // 只有回复的时候有
                    content,
                }
            */
            buildCommentApiData: data => ({ data }),
            /*
                包含喜欢、不喜欢
                传入的 data：{
                    commentId,
                    vote, // 有三个值：up、down、delete
                }
            */
            buildLikeApiData: data => ({ data }),
        });

        this.render = this.render.bind(this);
        this.renderComment = this.renderComment.bind(this);
        this.renderEmptyBlock = this.renderEmptyBlock.bind(this);

        this.showCommentInputBox = this.showCommentInputBox.bind(this);
        this.hideCommentInputBox = this.hideCommentInputBox.bind(this);
        this.updateCommentBtnStatus = this.updateCommentBtnStatus.bind(this);
        this.submit = this.submit.bind(this);

        this.render();
        this.bindEvents();
    }

    // 绑定事件
    bindEvents() {
        const { $el } = this.options;

        $el.on('touchstart', '.show-input-btn', this.showCommentInputBox);
        $el.on('touchstart', '.submit-btn', this.submit);
        $el.on('input', '.comment-input', this.updateCommentBtnStatus);
        $el.on('touchstart', '.comment-bar', e => e.stopPropagation());
        $('body').on('touchstart', this.hideCommentInputBox);
    }

    // 更新提交按钮的状态
    updateCommentBtnStatus(e) {
        const content = $(e.currentTarget).val();
        const $submitBtn = this.options.$el.find('.submit-btn');

        if (content) {
            $submitBtn.addClass('active');
        } else {
            $submitBtn.removeClass('active');
        }
    }

    // 提交评论
    submit(e) {
        const { $el, buildCommentApiData, apiUrl } = this.options;
        const content = $el.find('.comment-input').val();
        const $btn = $(e.currentTarget);

        if (!$btn.hasClass('active')) {
            return;
        }

        // 更新评论
        if (this.editingComment.id) {
            ajax(
                merge(
                    buildCommentApiData({
                        commentId: this.editingComment.id,
                        content,
                    }),
                    {
                        type: 'PUT',
                        success: this.render,
                    },
                ),
            );

            return;
        }

        // 回复评论
        if (this.toUserId) {
            ajax(
                merge(
                    buildCommentApiData({
                        to_user_id: this.toUserId,
                        content,
                    }),
                    {
                        url: apiUrl,
                        type: 'POST',
                        success: this.render,
                    },
                ),
            );

            return;
        }

        // 添加评论
        ajax(
            merge(buildCommentApiData({ content }), {
                url: apiUrl,
                type: 'POST',
                success: this.render,
            }),
        );
    }

    // 显示输入页面
    showCommentInputBox(e) {
        this.editingComment = {};

        if (e) {
            const $el = $(e.currentTarget);
            const commentData = $el.data('comment');
            this.editingComment = commentData || {};
            this.toUserId = $el.data('to-user-id');
        }

        this.$commentInputBox.show();
        this.$commentInputBox
            .find('input')
            .val(this.editingComment.content || '')
            .focus();

        return false;
    }

    // 隐藏输入页面
    hideCommentInputBox() {
        if (!this.isCreating) {
            this.$commentInputBox.hide();
            this.$commentInputBox.find('input').trigger('blur');
        }
    }

    // 渲染单个评论
    renderComment(data) {
        comment(
            merge(
                {
                    comment: this.options.parseItemData(data),
                },
                this.options,
            ),
        );
    }

    renderEmptyBlock() {
        const { $el } = this.options;

        const html = `
            <div class="empty-block">
                <img src="https://static.baydn.com/baydn/public/images/object-sofa.png" />
                <p>快来抢沙发吧～</p>
            </div>
        `;

        $el.append(html);
    }

    // 渲染输入页面
    renderCommentInputBox() {
        const $commentInputContainer = $('<div class="add-comment-bar-box"></div>');
        this.$commentInputBox = $(
            `<div class="comment-bar bottom-bar">
                <input class="comment-input" type= "text" placeholder= "添加评论..." />
                <i class="ib ib-send submit-btn clickable" />
            </div>`,
        );

        this.options.$el.append($commentInputContainer);
        $commentInputContainer.append(this.$commentInputBox);
        this.$commentInputBox.hide();
    }

    // 渲染
    render() {
        const { $el, currentUser, parseData, parseItemData } = this.options;

        $el.addClass('bay-comments');
        $el.html('');
        this.isCreating = false;

        // eslint-disable-next-line no-new
        new bayComponents.PullToLoadList({
            ipp: this.options.ipp,
            pageNum: this.options.pageNum,
            total: this.options.total,
            apiUrl: this.options.apiUrl,
            threshold: this.options.threshold,

            renderItem: this.renderComment,
            parseData: this.options.parseData,
            onLoadedFirstPage: data => {
                const commentsData = parseData(data);
                let commentData = {
                    user: {},
                };

                if (commentsData.items[0]) {
                    commentData = parseItemData(commentsData.items[0]);
                }

                $('.comments-num').html(commentsData.total);
                // 如果没有自己的评论，渲染添加评论
                if (commentsData.total === 0 || commentData.user.id !== currentUser.user_id_str) {
                    if (!this.options.isInteractiveDisabled) {
                        this.isCreating = true;
                        this.showCommentInputBox();
                    }
                }
                if (commentsData.total === 0) {
                    this.renderEmptyBlock();
                }
            },
        });

        this.renderCommentInputBox();
    }
}

const comments = options => new Comments(options);

export default comments;

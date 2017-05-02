import { merge, ajax, formatDate } from 'bay-utils';

class Comment {
    constructor(options) {
        this.options = options;

        this.render = this.render.bind(this);
        this.toggleLike = this.toggleLike.bind(this);
        this.toggleDislike = this.toggleDislike.bind(this);
        this.showOperations = this.showOperations.bind(this);
        this.hideOperations = this.hideOperations.bind(this);
        this.toReportPage = this.toReportPage.bind(this);

        this.render();
        this.bindEvents();
    }

    // 绑定事件
    bindEvents() {
        if (this.options.isInteractiveDisabled) {
            return;
        }

        this.$toggleLikeBtn = this.$comment.find('.toggle-like-btn');
        this.$toggleDislikeBtn = this.$comment.find('.toggle-dislike-btn');
        this.$operationList = this.$comment.find('.operation-list .list');

        this.$toggleLikeBtn.on('touchstart', this.toggleLike);
        this.$toggleDislikeBtn.on('touchstart', this.toggleDislike);
        this.$comment.on('touchstart', '.show-operations-btn', this.showOperations);
        this.$comment.on('touchstart', '.report-btn', this.toReportPage);
        $('body').on('touchstart', this.hideOperations);
    }

    // 跳转到举报页面
    toReportPage(e) {
        const $el = $(e.currentTarget);
        window.location.href = $el.attr('href');
        return false;
    }

    // 显示操作列表
    showOperations() {
        this.options.$el.find('.operation-list .list').hide();
        this.$operationList.css({ display: 'block' });
        return false;
    }

    // 隐藏操作列表
    hideOperations() {
        this.$operationList.hide();
    }

    // 更新喜欢/不喜欢状态
    updateLikeStatus(status) {
        const { comment, buildLikeApiData } = this.options;

        ajax(merge(buildLikeApiData({ vote: status, commentId: comment.id }), {
            type: 'PUT',
            data: { vote: status },
            success: () => {
                this.changeLikeStatus(status);
            },
        }));
    }

    // 改变喜欢/不喜欢状态
    changeLikeStatus(nextStatus) {
        const $voteNum = this.$comment.find('.vote-num');
        const isVotedUp = this.$toggleLikeBtn.hasClass('active');
        const voteNum = +$voteNum.html() || 0;

        /* 有三个状态：
            up: 喜欢
            down: 不喜欢
            delete: 取消喜欢/不喜欢
        */
        if (nextStatus === 'up') {
            this.$toggleLikeBtn.addClass('active');
            this.$toggleDislikeBtn.removeClass('disable');
            this.$toggleDislikeBtn.html('不喜欢');
            if (status !== nextStatus) {
                $voteNum.html(voteNum + 1);
            }
        }

        if (nextStatus === 'down') {
            this.$toggleLikeBtn.removeClass('active');
            this.$toggleDislikeBtn.addClass('disable');
            this.$toggleDislikeBtn.html('已不喜欢');
            if (isVotedUp) {
                $voteNum.html((voteNum - 1) || '');
            }
        }

        if (nextStatus === 'delete') {
            this.$toggleLikeBtn.removeClass('active');
            this.$toggleDislikeBtn.removeClass('disable');
            this.$toggleDislikeBtn.html('不喜欢');
            if (isVotedUp) {
                $voteNum.html((voteNum - 1) || '');
            }
        }
    }

    // 喜欢/取消喜欢
    toggleLike(e) {
        const $el = $(e.currentTarget);
        const isVotedUp = $el.hasClass('active');
        const action = isVotedUp ? 'delete' : 'up';

        this.updateLikeStatus(action);
    }

    // 不喜欢/取消不喜欢
    toggleDislike(e) {
        const $el = $(e.currentTarget);
        const isVotedDown = $el.hasClass('disable');
        const action = isVotedDown ? 'delete' : 'down';

        this.updateLikeStatus(action);

        return false;
    }

    // 渲染
    render() {
        const {
            $el, comment, currentUser, isInteractiveDisabled,
            hasLikeBtn, hasDislikeBtn, hasNestReplyBtn, hasReportBtn,
        } = this.options;
        const data = comment;
        const user = data.user || {};

        this.$comment = $(`
            <div class="comment">
                <div class="info">
                    <div class="user-partial">
                        <img class="avatar" src=${user.avatar} />
                        <div>
                            <p>${user.nickname}</p>
                            <p class="date">${formatDate(data.created_at)}</p>
                        </div>
                    </div>
                    <div class="operation-partial">
                        ${currentUser.user_id_str === user.id && !isInteractiveDisabled ?
                            `<i
                                class="ib ib-pencil operation-item show-input-btn"
                                data-comment='${JSON.stringify(data)}'
                            />` :
                            ''
                        }
                        ${hasLikeBtn ?
                            `<div class="toggle-like-btn operation-item ${data.is_voted_up ? 'active' : ''}">
                                <i class="ib ib-thumbs-up-o" />
                                <span class="vote-num">${data.vote_score || ''}</span>
                            </div> ` :
                            ''
                        }
                        ${(hasDislikeBtn || hasNestReplyBtn || hasReportBtn) && !isInteractiveDisabled ?
                            `<div class="operation-list">
                                <div class="dots show-operations-btn">…</div>
                                <div class="list">
                                    ${hasDislikeBtn ?
                                        `<span class="toggle-dislike-btn ${data.is_voted_down ? 'disable' : ''}">
                                            ${data.is_voted_down ? '已不喜欢' : '不喜欢'}
                                        </span> ` :
                                        ''
                                    }
                                    ${hasNestReplyBtn ?
                                        `<span
                                            class="show-input-btn"
                                            data-to-user-id=${user.id}
                                        >回复</span>` :
                                        ''
                                    }
                                    ${hasReportBtn ?
                                        `<a
                                            class="report-btn"
                                            href="/web/report?report_url=${encodeURIComponent(data.report_url)}&next=${encodeURIComponent(window.location.href)}"
                                        > 举报 </a>` :
                                        ''
                                    }
                                </div>
                            </div>` :
                            ''
                        }
                    </div>
                </div>
                <div class="content">${data.content}</div>
            </div>
        `);

        $el.append(this.$comment);
    }
}

const comment = options => new Comment(options);

export default comment;

const bindEvents = () => {

};

const initAudio = (item) => {
    console.log(item);
};

export const initAudios = (audioSelector, options = {}) => {
    $(audioSelector).each((i, item) => {
        initAudio(item);
    });
};

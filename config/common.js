export const handleTitleNotification = (info, params) => {
    if (params == 1) {
        return `<b>${info?.name}</b> đã đặt thành công đơn hàng <b>${info?.desc}</b> ${
            info?.type == 'paypal' ? 'thanh toán Paypal' : ''
        }`;
    } else {
        return `<b>${info?.name}</b> ${info.desc} ${info?.title}`;
    }
};

export const formatNumber = (number) => {
    return number?.toString()?.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
};

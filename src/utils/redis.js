// Internal hash keys

module.exports = exports = {
    userUnreadNotificationCount: 'unreadNotificationCount',
};

// map of all important user stats like - projects count, followers count etc
// Expiring after 30 days only after Total project claps are formed
exports.getUserStatsMapKey = function (userId) {
    return 'user:stats:' + userId;
};
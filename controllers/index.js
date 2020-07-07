module.exports.login = (req, res) => {
    res.end('logged')
}
module.exports.logout = (req, res) => {
    res.end('logged out')
}
module.exports.changed = (req, res) => {
    res.end('changed')
}
module.exports.deleted = (req, res) => {
    res.end('deleted')
}

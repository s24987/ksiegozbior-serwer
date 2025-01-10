module.exports.validateAuthor = function (name, birthdate) {
    const errorMessages = [];

    if (!name || !birthdate)
        errorMessages.push("Name or birthdate is empty.");
    if (name.length < 3)
        errorMessages.push("Name should be at least 3 characters long.")
    if (isNaN(Date.parse(birthdate)))
        errorMessages.push("Date is not in the right format.")

    return errorMessages;
}
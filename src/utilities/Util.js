const setDate = (dtToday) => {
    var month = dtToday.getMonth() + 1;
    var day = dtToday.getDate();
    var year = dtToday.getFullYear();
    if (month < 10) month = "0" + month.toString();
    if (day < 10) day = "0" + day.toString();
    return year + "-" + month + "-" + day;
}

const dateReport = (date) => {
    let d = new Date(date);
    return d.toLocaleTimeString("en-IN", {
        month: "numeric",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
};

const dateonlyReport = (date) => {
    let d = new Date(date);
    return d.toLocaleDateString("en-IN", {
        month: "numeric",
        day: "2-digit",
        year: "numeric",
    });
};
const timeonlyReport = (date) => {
    let d = new Date(date);
    return d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
};

const parseLastTxt = (str, first) => {
    let arr = str.split("/");
    let last_el = arr.length > 1 ? arr[arr.length - 1] : arr[0];
    arr.pop();
    if (first) {
        if (arr.length > 1) {
            return arr.join("/") + "/";
        } else {
            return arr[0];
        }
    } else {
        return last_el;
    }
}


const dateFormate = (date) => {
    let d = new Date(date);
    const today = new Date();
    try {
        if (
            d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear()
        ) {
            return "Today " + d.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
            });
        }
        if (
            d.getDate() === 1 + today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear()
        ) {
            return "Tomorrow " + d.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            });;
        }
        return d.toLocaleTimeString("en-US", {
            month: "long",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    }
    catch (err) {
        return err;
    }
};


const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    }
}

const amountFormate = (number, sign = false) => {
    let data = number.toLocaleString('en-IN');
    if (number > 0 && sign) {
        let pre_fix = "+";
        data = pre_fix + data;
    }
    return data;
}

const setFilter = (sw, arr, by_key = 'p_code') => {
    if (sw) {
        let matches = arr.filter(obj =>
            obj[by_key].toString().toLowerCase().includes(sw.toLowerCase())
        );
        console.log(matches)
        return matches
    } else {
        return arr
    }
}

const priceToWords = (num = 0) => {
    let n;
    var ones = ["", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "];
    var tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    if ((num = num.toString()).length > 9) return "Overflow: Maximum 9 digits supported";
    n = ("000000000" + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return;
    var str = "";
    str += n[1] != 0 ? (ones[Number(n[1])] || tens[n[1][0]] + " " + ones[n[1][1]]) + "Crore " : "";
    str += n[2] != 0 ? (ones[Number(n[2])] || tens[n[2][0]] + " " + ones[n[2][1]]) + "Lakh " : "";
    str += n[3] != 0 ? (ones[Number(n[3])] || tens[n[3][0]] + " " + ones[n[3][1]]) + "Thousand " : "";
    str += n[4] != 0 ? (ones[Number(n[4])] || tens[n[4][0]] + " " + ones[n[4][1]]) + "Hundred " : "";
    str += n[5] != 0 ? (str != "" ? "and " : "") + (ones[Number(n[5])] || tens[n[5][0]] + " " + ones[n[5][1]]) : "";
    return str;
}

const mapColor = (r) => {
    let rn = "btn btn-sm btn-primary"
    if (r === 2) rn = "btn btn-sm btn-danger"
    if (r === 3) rn = "btn btn-sm btn-warning"
    if (r === 4) rn = "btn btn-sm btn-warning"
    if (r === 5) rn = "btn btn-sm btn-info"
    if (r === 6) rn = "btn btn-sm btn-dark"
    if (r === 7) rn = "bg-green-100 hover:bg-green-50 dark:bg-green-500 dark:bg-green-500"
    if (r === 10) rn = "bg-pink-100 hover:bg-pink-50 dark:bg-pink-600 dark:hover:bg-pink-500"
    return rn;
}

const parseParty = (p_code) => {
    let p = p_code ? p_code.split("_") : [];
    if (p && p.length > 0) {
        return p[0]
    } else {
        return "";
    }
}

export {
    setDate,
    dateReport,
    parseLastTxt,
    dateFormate,
    amountFormate,
    toggleFullScreen,
    setFilter,
    priceToWords,
    mapColor,
    dateonlyReport,
    timeonlyReport,
    parseParty
}
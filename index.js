const csv = require('@fast-csv/parse');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const rules = require('./rules');

//#############################
let tagCounter = {};
const after_fileName = `vi_blog_train-after.csv`;

// Output stream
fs.appendFileSync(after_fileName, `title,tags\n`); //add csv Header

const csvPath = path.resolve(__dirname, 'vi_blog_train.csv');
const pathOptions = {
    headers: true,
    delimiter: ',',
    quote: '"',
    ignoreEmpty: true,
    discardUnmappedColumns: true,
    strictColumnHandling: true,
    trim: true
};

const counter = (setArray) => {
    setArray.forEach(tag => {
        if (tagCounter[tag] >= 1) {
            tagCounter[tag]++;
        } else tagCounter[tag] = 1;
    });
}

const tagNames = Object.keys(rules);
const tagNamesLength = tagNames.length;

const convertTag = (tag) => {
    let result;
    tagNames.forEach(tagName => {
        rules[tagName].forEach(key => {
            if (tag.includes(key)) {
                console.log({ tag, tagName });
                result = tagName;
            };
        })
    });
    return result;
}

const groupTags = (tags) => {
    let results = [];
    tags.forEach(tag => {
        const result = convertTag(tag);
        if (result)
            results.push(result);
    });
    console.log(results);
    results = results.filter(e => e !== null);
    return results;
}

const handleError = (error) => console.log(error);
const handleData = ({ title, tags }) => {
    const rawArray = Array.from(JSON.parse(tags.replace(/["]/g, "=").replace(/[']/g, "\"").replace(/[=]/g, "'")));
    const setArray = new Set(rawArray);
    const temp = {
        content: title,
        tags: Array.from(setArray)
    }
    temp.tags = groupTags(temp.tags);
    if (temp.tags.length === 0) return;
    counter(setArray);

    str = temp.tags.map(s => `'${s}'`).join(',');
    str = `"[${str}]"`;

    if (temp.content && temp.tags) {
        fs.appendFile(after_fileName, `${temp.content},${str}\n`, err => console.error(err));
        console.log(temp);
    }
};
const handleEOF = (rowCount) => {
    // console.info(`Total: ${rowCount} rows`);
    // console.info(tagCounter);
    fs.writeFile('vi_blog_train-report.json', JSON.stringify(tagCounter), function (err) {
        if (err) throw err;
        // console.info('Saved the report!');
    });
};

fs.createReadStream(csvPath)
    .pipe(csv.parse(pathOptions))
    .on('error', handleError)
    .on('data', handleData)
    .on('end', handleEOF);
const csv = require('@fast-csv/parse');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');

//#############################
let tagCounter = {};

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

const handleError = (error) => console.log(error);
const handleData = ({ title, tags }) => {
    const rawArray = Array.from(JSON.parse(tags.replace(/["]/g, "=").replace(/[']/g, "\"").replace(/[=]/g, "'")));
    const setArray = new Set(rawArray);
    const temp = {
        content: title,
        tags: Array.from(setArray)
    }
    counter(setArray);
    // console.info(temp);
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
const csv = require('@fast-csv/parse');
const path = require('path');
const fs = require('fs');

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

const handleError = (error) => console.log(error);
const handleData = (row) = console.log(row);
const handleEOF = (rowCount) => console.log(`Total: ${rowCount} rows`);

fs.createReadStream(csvPath)
    .pipe(csv.parse(pathOptions))
    .on('error', handleError)
    .on('data', handleData)
    .on('end', handleEOF);
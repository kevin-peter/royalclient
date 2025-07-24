import { CSVDownload } from 'react-csv';

const CsvExport = (props) => {
  return (<CSVDownload
    filename={props.filename}
    data={props.data}
  >Download me</CSVDownload>)
};

export default CsvExport;

import printJS from 'print-js'

const PdfExport = (props) => {
  printJS({
    printable: props.printable,
    type: props.type,
    documentTitle: props.documentTitle,
    targetStyles: ['*']
  })
  return (<></>)
};

export default PdfExport;

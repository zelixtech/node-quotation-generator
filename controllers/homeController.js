const fs = require('fs');
const pdf = require('pdf-creator-node');
const path = require('path');
// const options = require('../helpers/options');
// const data = require('../helpers/data');
var converter = require('number-to-words');


const homeview = (req, res, next) => {
    res.render('home');
}

let count = 000001;

const generatePdf = async (req, res, next) => {

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    var date = dd + '-' + mm + '-' + yyyy;
    var supRefNo = `${yyyy - 1}-${yyyy}`;

    const data = req.body

    // console.log(req.body)

    const html = fs.readFileSync(path.join(__dirname, '../views/Qoutation_template.html'), 'utf-8');

    const filename = "DSZ" + count + '.pdf';

    count++;

    let array = [];
    let rarray = [];
    let TACList = [];

    // console.log(data[0].products);

    let details = data[0]

    data[0].products.forEach((d, i) => {

        var DTBShow = d.detailsTobeShown;
        var Productmeta = {};
        var customNote = {};

        const cstNote = d.note ? d.note.split(/\r?\n/) : null;

        if (cstNote) {
            cstNote.map((note, id) => {
                customNote[id] = note;
            })
        }


        Object.entries(DTBShow).map(([key, value], id) => {
            Productmeta[id] = `${key}: ${value}`
        })

        // var size = "";
        var unit_cost;

        if (d.length === "NA" && d.width === "NA") {
            // size = ``;
            unit_cost = 1;
        } else if (d.length === "NA") {
            // size = `${d.width} ${d.wxlunit}`
            unit_cost = d.width;
        } else if (d.width === "NA") {
            // size = `${d.length} ${d.wxlunit}`
            unit_cost = d.length;
        } else {
            // size = `${d.width} X ${d.length} ${d.wxlunit}`
            unit_cost = d.width * d.length
        }


        // if (d.length === "NA" && d.width === "NA") {
        //     size = ``;
        //     unit_cost = 1;
        // } else if (d.length === "NA") {
        //     size = `${d.width} ${d.wxlunit}`
        //     unit_cost = d.width;
        // } else if (d.width === "NA") {
        //     size = `${d.length} ${d.wxlunit}`
        //     unit_cost = d.length;
        // } else {
        //     size = `${d.width} X ${d.length} ${d.wxlunit}`
        //     unit_cost = d.width * d.length
        // }



        const prod = {
            id: i + 1,
            description: d.name,
            data: Productmeta,
            quantity: d.quantity,
            rate: (d.rate * unit_cost).toLocaleString('en-IN', {
                style: 'currency',
                currency: details.metadata.currency
            }),
            note: customNote,
            unit: d.unit,
            modelNo: d.ModleNo,
            HSNCode: d.HSNCode,
            total: d.quantity * d.rate * unit_cost,
            subtotal: (d.quantity * d.rate * unit_cost).toLocaleString('en-IN', {
                style: 'currency',
                currency: details.metadata.currency
            })
        }
        array.push(prod);
    });



    data[0].rproducts.forEach((d, i) => {
        const rprod = {
            id: i + 1,
            description: d.name,
            data: d.data[0],
            quantity: d.quantity,
            thikness: d.thikness,
            rate: d.rate.toLocaleString('en-IN', {
                style: 'currency',
                currency: details.metadata.currency
            }),
            unit: d.unit,
            total: d.quantity * d.rate,
            subtotal: (d.quantity * d.rate).toLocaleString('en-IN', {
                style: 'currency',
                currency: details.metadata.currency
            })
        }
        rarray.push(rprod);
    });


    const TACarray = details.TAC.split(/\r?\n/);

    TACarray.forEach((d) => {

        const tacdata = {
            data: d
        }

        TACList.push(tacdata);

    })

    let subtotal = 0;
    let quantityTotal = 0;
    array.forEach(i => {
        subtotal += i.total;
        quantityTotal += parseInt(i.quantity);
    });


    let transportation_cost = details.metadata.transportation_cost;
    let packaging_and_forwarding_charges = details.metadata.packaging_and_forwarding_charges;


    if (!isNaN(transportation_cost)) {
        subtotal += parseInt(transportation_cost);
        transportation_cost = parseInt(transportation_cost);
        transportation_cost = transportation_cost.toLocaleString('en-IN', {
            style: 'currency',
            currency: details.metadata.currency
        });

    }


    if (!isNaN(packaging_and_forwarding_charges) && packaging_and_forwarding_charges !== "") {
        subtotal += parseInt(packaging_and_forwarding_charges);
        packaging_and_forwarding_charges = parseInt(packaging_and_forwarding_charges);
        packaging_and_forwarding_charges = packaging_and_forwarding_charges.toLocaleString('en-IN', {
            style: 'currency',
            currency: details.metadata.currency
        });
    }

    let tax = (subtotal * details.metadata.GST) / 100;
    let grandtotal = subtotal + tax;

    function toTitleCase(str) {
        str = str.toLowerCase().split(' ');
        for (var i = 0; i < str.length; i++) {
            str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
        }
        return str.join(' ');
    }

    // const inword = ""
    var inword = converter.toWords(grandtotal);
    inword = toTitleCase(inword);

    grandtotal = grandtotal.toLocaleString('en-IN', {
        style: 'currency',
        currency: details.metadata.currency
    });

    tax = tax.toLocaleString('en-IN', {
        style: 'currency',
        currency: details.metadata.currency
    });

    var inwordPrefix = ""
    if (details.metadata.currency === "INR") {
        inwordPrefix = "Indian Rupees "
    } else {
        inwordPrefix = "US Dollar "
    }


    const obj = {
        prodlist: array,
        rprodlist: rarray,
        subtotal: subtotal,
        quantityTotal: quantityTotal,
        tax: tax,
        gtotal: grandtotal,
        gtotalInword: inword,
        inwordPrefix: inwordPrefix,
        metadata: details.metadata,
        sender: details.sender,
        client: details.client,
        IsRP: details.isRP,
        IsTAC: details.isTAC,
        TAC: TACList,
        date: date,
        supRefNo: supRefNo,
        packaging_and_forwarding_charges: packaging_and_forwarding_charges,
        transportation_cost: transportation_cost,


    }

    var options = {
        format: "A3",
        orientation: "portrait",
        border: "10mm",
    };

    var document = {
        html: html,
        data: {
            products: obj
        },
        path: './docs/' + filename,
        type: "", // "stream" || "buffer" || "" ("" defaults to pdf)
    };

    await pdf
        .create(document, options)
        .then((res) => {
            console.log(res);
        })
        .catch((error) => {
            console.error(error);
        });

    const filepath = 'http://localhost:8000/docs/' + filename;



    // var options = {
    //     root: "D:\\zelixprojects\\node-quotation-generator\\docs"
    // };


    // var qoutation = fs.readFileSync('D:\\zelixprojects\\node-quotation-generator\\docs\\' + filename);
    // res.contentType("application/pdf");
    // res.send(qoutation);


    // res.sendFile(path.join(__dirname, '../docs/' + filename));
    res.send(filepath)
}


module.exports = {
    homeview,
    generatePdf
}
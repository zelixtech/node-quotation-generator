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

    try {

        const data = req.body

        console.log(req.body)

        const html = fs.readFileSync(path.join(__dirname, '../views/Qoutation_template.html'), 'utf-8');

        const filename = "DSZ" + count + '.pdf';

        count++;

        let product_array = [];
        let recommend_array = [];
        let TACList = [];


        let details = data;

        data.products.forEach((d, i) => {

            var DTBShow = d.detailsTobeShown;
            var Productmeta = {};
            var customNote = {};

            const cstNote = d.note ? d.note.split(/\r?\n/) : null;

            if (cstNote) {
                cstNote.map((note, id) => {
                    customNote[id] = note;
                })
            }


            if (DTBShow) {
                Object.entries(DTBShow).map(([key, value], id) => {
                    Productmeta[id] = `${key}: ${value}`
                })
            }

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

            product_array.push(prod);
        });

        var totalProducts = product_array.length;

        data.recommend_products.forEach((d, i) => {


            var DTBShow = d.detailsTobeShown;
            var Productmeta = {};
            var customNote = {};

            const cstNote = d.note ? d.note.split(/\r?\n/) : null;

            if (cstNote) {
                cstNote.map((note, id) => {
                    customNote[id] = note;
                })
            }


            if (DTBShow) {
                Object.entries(DTBShow).map(([key, value], id) => {
                    Productmeta[id] = `${key}: ${value}`
                })
            }

            if (d.length === "NA" && d.width === "NA") {
                unit_cost = 1;
            } else if (d.length === "NA") {
                unit_cost = d.width;
            } else if (d.width === "NA") {
                unit_cost = d.length;
            } else {
                unit_cost = d.width * d.length
            }

            const rprod = {
                id: totalProducts + i + 1,
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
            recommend_array.push(rprod);
        });


        const TACarray = details.TAC.split(/\r?\n/);

        TACarray.forEach((tac_item) => {

            const tacdata = {
                data: tac_item
            }

            TACList.push(tacdata);

        })




        // calculations 

        let subtotal = 0;
        let quantityTotal = 0;
        product_array.forEach(i => {
            subtotal += i.total;
            quantityTotal += parseFloat(i.quantity);
        });


        let transportation_cost = details.metadata.transportation_cost;
        let packaging_and_forwarding_charges = details.metadata.packaging_and_forwarding_charges;
        let custom_field1_cost = details.metadata.custom_field1_value;
        let custom_field2_cost = details.metadata.custom_field2_value;


        if (!isNaN(transportation_cost)) {
            subtotal += parseFloat(transportation_cost);
            transportation_cost = parseFloat(transportation_cost);
            transportation_cost = transportation_cost.toLocaleString('en-IN', {
                style: 'currency',
                currency: details.metadata.currency
            });

        }


        if (!isNaN(packaging_and_forwarding_charges) && packaging_and_forwarding_charges !== "") {
            subtotal += parseFloat(packaging_and_forwarding_charges);
            packaging_and_forwarding_charges = parseFloat(packaging_and_forwarding_charges);
            packaging_and_forwarding_charges = packaging_and_forwarding_charges.toLocaleString('en-IN', {
                style: 'currency',
                currency: details.metadata.currency
            });
        }

        if (!isNaN(custom_field1_cost) && custom_field1_cost !== "") {
            subtotal += parseFloat(custom_field1_cost);
            custom_field1_cost = parseFloat(custom_field1_cost);
            custom_field1_cost = custom_field1_cost.toLocaleString('en-IN', {
                style: 'currency',
                currency: details.metadata.currency
            });
        }

        if (!isNaN(custom_field2_cost) && custom_field2_cost !== "") {
            subtotal += parseFloat(custom_field2_cost);
            custom_field2_cost = parseFloat(custom_field2_cost);
            custom_field2_cost = custom_field2_cost.toLocaleString('en-IN', {
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
            prodlist: product_array,
            rprodlist: recommend_array,
            subtotal: subtotal,
            quantityTotal: quantityTotal,
            tax: tax,
            gtotal: grandtotal,
            gtotalInword: inword,
            inwordPrefix: inwordPrefix,
            metadata: details.metadata,
            sender: details.sender,
            client: details.client,
            IsRP: details.IsRP,
            IsTAC: details.IsTAC,
            TAC: TACList,
            packaging_and_forwarding_charges: packaging_and_forwarding_charges,
            transportation_cost: transportation_cost,
            custom_field1_cost: custom_field1_cost,
            custom_field2_cost: custom_field2_cost,
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

    } catch (error) {
        console.log(error)
    }
}


module.exports = {
    homeview,
    generatePdf
}
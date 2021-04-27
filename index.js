const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;
const minimist = require('minimist');

let args = minimist(process.argv.slice(2), {
    alias: {
        t: 'table',
        c: 'covers',
        n: 'name',
        o: 'order'
    }
});

let printer = new ThermalPrinter({
    type: PrinterTypes.STAR,
    interface: 'tcp://10.10.6.37',

});

if (process.argv[2] == 'help') {
    console.log('[-t, --table]: Table number\n[-n, --name]: Name on check\n[-c, --covers]: Amount of covers\n[-o, --order]: Order content\n    [/] = new line\n    [_] = space\n    [+|*] = indented new line')
    process.exit()
}


let now = new Date();

Date.prototype.toShortFormat = function() {

    let monthNames =["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep", "Oct","Nov","Dec"];
    
    let day = this.getDate();
    
    let monthIndex = this.getMonth();
    let monthName = monthNames[monthIndex];
    
    let year = this.getFullYear();

    if (day <= 9) { day = '0' + day }
    
    return `Date: ${day}/${monthName}/${year}`;  
}

const name = args.n.replace(/([_])/g, ' ')
const order = args.o.replace(/([_])/g, ' ').replace(/([/])/g, '\n').replace(/[+]/g, '\n  + ').replace(/[*]/g, '\n  * ')

function gap(left, right) {
    var gap = ' '
    var y = 0
    var spaces = 43 - (left.length + right.length)
   
    for (var x = 0; x < spaces; x++) {
        if (x <= spaces) { y = x }
    }

    return left + gap.repeat(y) + right
}

function ticket() {
//    printer.density();
//    printer.twoTone();
//    printer.bold();
    printer.newLine();
    printer.println('               Food Picklist')
    printer.newLine();
    printer.newLine();

    printer.println(gap(now.toShortFormat(), 'Service No: 480635'));
    printer.println(gap('HG1 Bar Till 1', name));
    printer.println('Table ' + args.t + ' (Bar)');
    printer.newLine();
    printer.println(gap('Table ' + args.t, 'Covers: ' + args.c));
    printer.alignCenter();
    printer.newLine();
    printer.invert(true)
    printer.println(`Time: ${now.toLocaleTimeString().slice(0, 5)}`)
    printer.invert(false)
    printer.newLine();
    printer.println('-------------- MAINS ORDER ---------------')

    // order content
    printer.alignLeft();
    printer.newLine();
    printer.println(order);
    printer.newLine();

    printer.println('-------------- END OF ORDER --------------')
    printer.newLine();
    printer.partialCut(); 
}

ticket()
ticket()

try {
    let execute = printer.execute()
    console.error("Print done!");
  } catch (error) {
    console.log("Print failed:", error);
  }

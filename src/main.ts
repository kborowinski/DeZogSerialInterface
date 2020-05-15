import {DzrpSocketSerial} from './dzrpsocketserial';
import {Log} from './log';
import * as net from 'net';
import * as tcpPortUsed from 'tcp-port-used';


class Startup {

    /// The port of the socket.
    protected static socketPort: number=12000;

    /// The name of the serial port, e.g. "/dev/usbserial" or "COM1".
    protected static serialPort: string= '/dev/cu.usbserial-14620';

    /// The baudrate to use for the serial port.
    protected static serialBaudrate: number = 230400;

    /**
     * The main program. This is the start point.
     * The command line argument list is evaluated and the socket
     * is started.
     */
    public static async main(): Promise<number> {

        try {
            // Get arguments
            const args = process.argv.splice(2);

            // Go through arguments
            await this.evaluateArgs(args);

            // Print parameters
            console.log('Using socket='+this.socketPort+', serial='+this.serialPort+', baudrate='+this.serialBaudrate);

            // Start dzrp socket
            //const socket=
            new DzrpSocketSerial(this.socketPort, this.serialPort, this.serialBaudrate);
        }
        catch(e) {
            // Output any problems
            console.error(e);
            return 1;
        }

    return 0;
    }


    /**
     * Prints command line help.
     */
    protected static printHelp() {
        console.log(`
cdezogserialif is a program that allow DeZog to talk to a ZXNext via a serial interface.
It opens a serial connection to the ZXNext and on the other side opens a socket listener so that Dezog can connect to the socket.

Example command line:

$ cmdsocket -socket 12000
Starts to listen on port 12000.

General usage:
cmdsocket -socket port -serial serial_if -baudrate rate [-log] [-test]
  options:
    -h|-help: Prints this help.
    -v|-version: Prints the version number.
    -socket port: The socket port to connect to, default is 12000.
    -serial serial_if: The serial port, e.g. "/dev/usbserial" (Linux/macOS) or "COM1" (Windows).
    -baudrate rate: The baudrate to use for the serial port. Default=230400.
    -log: Enables logging to console.
    -test: Use as last argument. If given the program tries to open a 
    socket and a serial connection. Just to see if it could work.

`);
    }


    /**
     * Evaluates the command line arguments.
     * @param args List of arguments.
     */
    protected static async evaluateArgs(args: Array<string>): Promise<void> {

        // Iterate all arguments
        let arg;
        const argCount=args.length;
        while (arg=args.shift()) {

            // Check option
            if (arg.startsWith('-')) {
                switch (arg) {
                    // Help
                    case '-help':
                    case '-h':
                        this.printHelp();
                        break;

                    // Version
                    case '-version':
                    case '-v':
                        const pckg=require('../package.json');
                        console.log('Version: '+pckg.version);
                        break;

                    case '-log':
                        Log.enabled=true;
                        break;

                    // Socket port
                    case '-socket':
                        const portString=args.shift();
                        if (portString==undefined)
                            throw "No socket port given.";
                        this.socketPort=parseInt(portString);
                        break;

                    // Serial interface
                    case '-serial':
                        {
                            this.serialPort=args.shift()!;
                            if (this.serialPort==undefined)
                                throw "No socket port given.";
                        }
                        break;

                    // Serial baudrate
                    case '-baudrate':
                        const baudrateString=args.shift();
                        if (baudrateString==undefined)
                            throw "No socket port given.";
                        this.serialBaudrate=parseInt(baudrateString);
                        break;

                    case '-test':
                        await this.testSocket();
                        process.exit(0);
                        break;
                    
                    default:
                        throw "Unknown argument: '"+arg+"'";
                }
            }
            else {
                // no option ("-")
                throw "Wrong argument. Use 'dezogserialif -h' to show all options."
            }
        }

        // Check if any argument given
        if (argCount==0)
            throw "No arguments. Use 'dezogserialif -h' to show all options."
        
        this.checkArguments();
    }


    /**
     * Checks if the arguments are given and throws an exception
     * if not.
     */
    protected static checkArguments() {
        // Check arguments:
        if (!this.serialBaudrate)
            throw "No serial baudrate given.";
        if (!this.serialPort)
            throw "No serial port given.";
        if (!this.socketPort)
            throw "No socket port given.";
    }



    /**
     * Tests to setup a socket and the serial interface.
     */
    protected static async testSocket(): Promise<void> {
        this.checkArguments();
        try {
            this.socketPort=10000;
            const socketInUse=await tcpPortUsed.check(this.socketPort);
            if (socketInUse)
                console.log("Socket is already in use. Choose another port.");
            else
                console.log("Socket OK.");
        }
        catch (e) {
            console.log("Socket error: "+e);
        }
    }

}






Startup.main();

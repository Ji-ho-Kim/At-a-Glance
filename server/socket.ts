import http from "http";
import { Server } from "socket.io";
import { SerialPort, ReadlineParser } from "serialport";

let interval: number = 1250;

const isDev = false;

let serialPort: any = null;
let parser: any = null;

// SerialPort의 path를 가져 옴. 테스트 할 때 사용.
SerialPort.list().then((ports) => {
  console.log(ports);
});

if (!isDev) {
  serialPort = new SerialPort({
    path: "COM3",
    baudRate: 9600,
  });

  parser = new ReadlineParser();

  serialPort.pipe(parser);
}

const socket = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("disconnect", () => {
      console.log(`${socket.id} is disconnected`);
    });

    parser.on("data", (data: any) => {
      // const transformed = Math.abs(d / Math.abs(targetValue));

      // if (Math.abs(anchorValue) >= transformed) {
      // console.log("no value");

      // return;
      // }

      socket.emit("MY_DATA", data);

      console.log("data: " + data);
    });

    // TODO: Delete this setInterval, because it is for test
    // setInterval(() => {
    //   socket.emit("MY_DATA", Math.floor(Math.random() * 5));
    // }, 1250);
  });
};

export default socket;

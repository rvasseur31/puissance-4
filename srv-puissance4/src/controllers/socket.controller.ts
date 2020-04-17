// export function SocketMessage(incomeMessage: any) {
//     let json = JSON.parse(incomeMessage);
//     if (json.action == "new-participant") {
//         wss.clients.forEach(function each(client) {
//             if (client.readyState === WebSocket.OPEN) {
//                 client.send(json.message);
//             }
//         });
//     }
//     console.log(json);
// }
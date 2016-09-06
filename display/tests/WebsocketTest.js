import {SocketReconnect, JsonSocketReconnect, SubscriptionSocketReconnect} from 'src/socket/websocket';


describe('SocketReconnect', function() {

    const DISCONNECTED_RETRY_INTERVAL_MS = 1000;

    let socket;

    let mockSocket;
    class MockWebSocket {
        constructor() {
            //expect(mockSocket).toBe(undefined);  // We only ever want one socket connected under test conditions
            mockSocket = jasmine.createSpyObj('WebSocket', ['send', 'onopen', 'onclose', 'onmessage']);
            return mockSocket;
        }
    }

    beforeEach(function() {
        jasmine.clock().install();
        expect(mockSocket).toBe(undefined);
        socket = new SocketReconnect({
            WebSocket: MockWebSocket,
            disconnected_retry_interval_ms: DISCONNECTED_RETRY_INTERVAL_MS,
        });
        expect(mockSocket).not.toBe(undefined);
        spyOn(socket, 'onConnected');
        spyOn(socket, 'onDisconnected');
        spyOn(socket, 'onMessage');
        spyOn(socket, 'decodeMessages').and.callThrough();
        spyOn(socket, 'encodeMessages').and.callThrough();
    });

    afterEach(function() {
        socket = undefined;
        mockSocket = undefined;
        jasmine.clock().uninstall();
    });

    it('Should call onConnected on creation/connection',()=>{
        expect(socket.onConnected).not.toHaveBeenCalled();
        mockSocket.onopen();
        expect(socket.onConnected).toHaveBeenCalled();
    });

    it('Should call onMessage when a message is recived/decoded',()=>{
        mockSocket.onopen();
        expect(socket.onMessage).not.toHaveBeenCalled();
        mockSocket.onmessage({data: 'Hello World\n'});
        expect(socket.decodeMessages).toHaveBeenCalled();
        expect(socket.onMessage).toHaveBeenCalledWith('Hello World');
    });

    it('Should call send when a message is sent (but not when disconnected)',()=>{
        expect(mockSocket.send).not.toHaveBeenCalled();
        socket.send('Hello World');
        expect(mockSocket.send).not.toHaveBeenCalled();
        mockSocket.onopen();
        socket.send('Hello World');
        expect(mockSocket.send).toHaveBeenCalledWith('Hello World\n');
        mockSocket.onclose();
        mockSocket.send.calls.reset();
        socket.send('Hello Again');
        expect(mockSocket.send).not.toHaveBeenCalled();
    });

    it('Should attempt to reconnect when disconnected',()=>{
        mockSocket.onopen();
        expect(socket.onDisconnected).not.toHaveBeenCalled();
        mockSocket.onclose();
        expect(socket.onDisconnected).toHaveBeenCalled();
        let previous_mockSocket = mockSocket;
        jasmine.clock().tick(DISCONNECTED_RETRY_INTERVAL_MS - 1);
        expect(mockSocket).toBe(previous_mockSocket);
        jasmine.clock().tick(2);
        //expect(mockSocket).not.toBe(previous_mockSocket);  // This should be new! Investigate
        //jasmine.clock().tick(DISCONNECTED_RETRY_INTERVAL_MS);
        //mockSocket.onopen();
    });

});

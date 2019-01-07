import socketserver
import sys
import util

"""
TODO:
 * Logging
 * Backup Server
 * Testing
 * 
"""

class TCPHandler(socketserver.BaseRequestHandler):
	"""
    The RequestHandler class for our server.

    It is instantiated once per connection to the server, and must
    override the handle() method to implement communication to the
    client.
    """

	def handle(self):
		self.data = b''
		while self.data != b'end':
			self.data = util.recv_msg(self.request)
			print("{}:{} wrote:".format(self.client_address[0], self.client_address[1]))
			print(self.data)
			util.send_msg(self.request, self.data.upper())

def serverRun():
	HOST, PORT = "localhost", 9999
	if len(sys.argv) == 2:
		PORT = int(sys.argv[1])
	elif len(sys.argv) == 3:
		HOST = sys.argv[1]
		PORT = int(sys.argv[2])
	print("HOST {}, PORT {}".format(HOST, PORT))

	with socketserver.TCPServer((HOST, PORT), TCPHandler) as server:
		print("Server running on {}:{}".format(server.server_address[0], server.server_address[1]))
		server.serve_forever()

if __name__ == "__main__":
	serverRun()
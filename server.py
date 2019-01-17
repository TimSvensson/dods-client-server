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

class ThreadedTCPRequestHandler(socketserver.BaseRequestHandler):
	"""
	The RequestHandler class for our server.

	It is instantiated once per connection to the server, and must
	override the handle() method to implement communication to the
	client.
	"""
	
	def setup(self):
		print(self.client_address[0], self.client_address[1], "connected")

	def handle(self):
		self.data = b''
		flag = True
		while flag == True:
			self.data = util.recv_msg(self.request)
			print("{}:{} wrote:".format(self.client_address[0], self.client_address[1]))
			print(self.data)
			try:
				if self.data != None:
					util.send_msg(self.request, self.data)
				else:
					flag = False
			except AttributeError as e:
				pass

	def finish(self):
		print(self.client_address[0], self.client_address[1], "disconnected")

class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
	pass

def create(ip='localhost', port=9999):
	return ThreadedTCPServer((ip, port), ThreadedTCPRequestHandler)

def start(server=None):
	if server == None:
		server = create()
	print("Server running on {}:{}".format(server.server_address[0], server.server_address[1]))
	server.serve_forever()

if __name__ == "__main__":
	start()
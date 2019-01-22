import socketserver, sys, util, time, logging

"""
TODO:
 * Backup Server
 * Testing
 * 
"""

logname="logfile_server_{}.log".format(time.strftime("D%y%m%d_%H%M%S"))
logging.basicConfig(
	filename=logname,
	level=logging.DEBUG,
	format='%(asctime)s %(levelname)s\t%(thread)d %(threadName)s\t%(module)s.%(funcName)s\t%(message)s')

class ThreadedTCPRequestHandler(socketserver.BaseRequestHandler):
	"""
	The RequestHandler class for our server.

	It is instantiated once per connection to the server, and must
	override the handle() method to implement communication to the
	client.
	"""

	clients = []
	servers = []
	
	def setup(self):
		logging.info("{} {} {}".format(self.client_address[0], self.client_address[1], "connected"))
		self.clients.append(self.request)

	def handle(self):
		self.data = b''
		flag = True
		while flag == True:
			self.data = util.recv_msg(self.request)
			logging.debug("{}:{} wrote: {}".format(self.client_address[0], self.client_address[1], self.data))
			try:
				if self.data != None:
					for c in self.clients:
						util.send_msg(c, self.data)
				else:
					flag = False
			except AttributeError as e:
				logging.warning("Exception in Handler: {}".format(e))

	def finish(self):
		logging.info("{} {} {}".format(self.client_address[0], self.client_address[1], "disconnected"))
		self.clients.remove(self.request)

class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
	pass

def create(ip='localhost', port=9001):
	return ThreadedTCPServer((ip, port), ThreadedTCPRequestHandler)

def start(server=None):
	if server == None:
		server = create()
	if __name__ == "__main__":
		print(("Server running on {}:{}".format(server.server_address[0], server.server_address[1])))
	else:
		logging.info("Server running on {}:{}".format(server.server_address[0], server.server_address[1]))
	server.serve_forever()

if __name__ == "__main__":
	start()
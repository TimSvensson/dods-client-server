import socket
import server
import sys
from multiprocessing import Process
import util

class client():
	"""
	"""

	def __init__(self, ip='localhost', port=0):
		self.ip = ip
		self.port = port

	def connect(self):
		self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
		self.sock.connect((self.ip, self.port))

	def close(self):
		self.sock.close()
		self.sock = None

	def send(self, message, recipients=None):
		"""
		Sends the 'message' to all in clinets in 'recipients'.

		If 'recipients' is either an empty list or None, send 'message' to all clients.
		"""

		if recipients == None:
			util.send_msg(self.sock, message)
		
	def recv(self):
		try:
			msg = util.recv_msg(self.sock)
		except ConnectionAbortedError as e:
			print("Connection aborted, reconnecting...")
			self.connect()
			return b''
		return msg

	def info(self):
		pass

if __name__ == '__main__':
	HOST, PORT = 'localhost', 9999
	c = client(HOST, PORT)
	user = ''
	c.connect()

	while user != "end":
		user = input("Send to server > ")
		c.send(bytes(user, 'utf-8'))
		print("Reply: {}".format(str(c.recv(), 'utf-8')))

	c.close()
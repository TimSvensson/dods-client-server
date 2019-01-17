import unittest
import server
import client
import threading
import time

class ClientTestCases(unittest.TestCase):
	"""
	"""

	def setUp(self):
		self.s0 = server.create(port=0)
		self.s_thread = threading.Thread(target=server.start, args=(self.s0,))
		self.s_thread.daemon = True
		self.s_thread.start()

		self.c0 = client.Client(self.s0.server_address[0], self.s0.server_address[1])
		self.c0.connect()

	def tearDown(self):
		self.s0.shutdown()
		self.c0.close()

	def test_send_and_receive_messages_to_self(self):
		reply = self.c0.recv()
		self.assertEqual(reply, b'')
		msg = "test"
		self.c0.send(bytes(msg, 'utf-8'))
		#time.sleep(1)
		reply = str(self.c0.recv(), 'utf-8')
		self.assertEqual(msg, reply)

"""
	def test_discover_other_clients(self):
		self.assertTrue(False)

	def test_send_and_receive_messages_to_all(self):
		self.assertTrue(False)

	def test_send_and_receive_messages_to_specific(self):
		self.assertTrue(False)

	def test_discover_other_servers(self):
		self.assertTrue(False)

	def test_reconnect_to_other_server(self):
		self.assertTrue(False)

	def test_info_to_user(self):
		self.assertTrue(False)
"""

if __name__ == '__main__':
    unittest.main()
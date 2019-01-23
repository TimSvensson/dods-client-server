class ID():
	"""
	"""

	def __init__(self, _ip, _port):
		self.host 	= _ip, _port

	def equals(self, other):
		if self.host[0] != other.host[0]:
			return False
		if self.host[1] != other.host[1]:
			return False
		return True